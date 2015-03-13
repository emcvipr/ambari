/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.ambari.server.state.stack.upgrade;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;

import org.apache.ambari.server.stack.HostsType;
import org.apache.ambari.server.state.UpgradeContext;
import org.apache.ambari.server.state.stack.UpgradePack.ProcessingComponent;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

/**
 * Used to represent cluster-based operations.
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name="cluster")
public class ClusterGrouping extends Grouping {

  /**
   * Stages against a Service and Component, or the Server
   */
  @XmlElement(name="execute-stage")
  public List<ExecuteStage> executionStages;

  @XmlTransient
  private ClusterBuilder m_builder = new ClusterBuilder();

  @Override
  public ClusterBuilder getBuilder() {
    return m_builder;
  }


  /**
   * Represents a single-stage execution that happens as part of a cluster-wide
   * upgrade or downgrade.
   */
  public static class ExecuteStage {
    @XmlAttribute(name="title")
    public String title;

    @XmlAttribute(name="id")
    public String id;

    @XmlElement(name="direction")
    public Direction intendedDirection = null;

    /**
     * Optional service name, can be ""
     */
    @XmlAttribute(name="service")
    public String service;

    /**
     * Optional component name, can be ""
     */
    @XmlAttribute(name="component")
    public String component;

    @XmlElement(name="task")
    public Task task;
  }

  public class ClusterBuilder extends StageWrapperBuilder {

    @Override
    public void add(UpgradeContext ctx, HostsType hostsType, String service,
        boolean clientOnly, ProcessingComponent pc) {
      // !!! no-op in this case
    }

    @Override
    public List<StageWrapper> build(UpgradeContext ctx) {
      if (null == ClusterGrouping.this.executionStages) {
        return Collections.emptyList();
      }

      List<StageWrapper> results = new ArrayList<StageWrapper>();

      if (executionStages != null) {
        for (ExecuteStage execution : executionStages) {
          if (null != execution.intendedDirection &&
              execution.intendedDirection != ctx.getDirection()) {
            continue;
          }

          Task task = execution.task;

          StageWrapper wrapper = null;

          switch (task.getType()) {
            case MANUAL:
              wrapper = getManualStageWrapper(ctx, execution);
              break;

            case SERVER_ACTION:
              wrapper = new StageWrapper(
                  StageWrapper.Type.SERVER_SIDE_ACTION,
                  execution.title,
                  new TaskWrapper(null, null, Collections.<String>emptySet(), task));
              break;

            case EXECUTE:
              wrapper = getExecuteStageWrapper(ctx, execution);
              break;

            default:
              break;
          }

          if (null != wrapper) {
            results.add(wrapper);
          }
        }
      }

      return results;
    }
  }

  private StageWrapper getManualStageWrapper(UpgradeContext ctx, ExecuteStage execution) {

    String service   = execution.service;
    String component = execution.component;
    String id        = execution.id;
    Task task        = execution.task;

    if (null != id && id.equals("unhealthy-hosts")) {

      // !!! this specific task is used ONLY when there are unhealthy
      if (ctx.getUnhealthy().isEmpty()) {
        return null;
      }
      ManualTask mt = (ManualTask) task;

      fillHostDetails(mt, ctx.getUnhealthy());
    }

    Set<String> realHosts = Collections.emptySet();

    if (null != service && !service.isEmpty() &&
        null != component && !component.isEmpty()) {

      HostsType hosts = ctx.getResolver().getMasterAndHosts(service, component);

      if (null == hosts) {
        return null;
      } else {
        realHosts = new LinkedHashSet<String>(hosts.hosts);
      }
    }

    return new StageWrapper(
        StageWrapper.Type.SERVER_SIDE_ACTION,
        execution.title,
        new TaskWrapper(service, component, realHosts, task));
  }

  private StageWrapper getExecuteStageWrapper(UpgradeContext ctx, ExecuteStage execution) {
    String service   = execution.service;
    String component = execution.component;
    Task task        = execution.task;

    if (null != service && !service.isEmpty() &&
        null != component && !component.isEmpty()) {

      HostsType hosts = ctx.getResolver().getMasterAndHosts(service, component);

      if (hosts != null) {
        Set<String> realHosts = new LinkedHashSet<String>(hosts.hosts);

        ExecuteTask et = (ExecuteTask) task;

        if (null != et.hosts && "master".equals(et.hosts) && null != hosts.master) {
          realHosts = Collections.singleton(hosts.master);
        }

        return new StageWrapper(
            StageWrapper.Type.RU_TASKS,
            execution.title,
            new TaskWrapper(service, component, realHosts, task));
      }
    }
    return null;
  }

  private void fillHostDetails(ManualTask mt, Map<String, List<String>> unhealthy) {

    JsonArray arr = new JsonArray();
    for (Entry<String, List<String>> entry : unhealthy.entrySet()) {
      JsonObject hostObj = new JsonObject();
      hostObj.addProperty("host", entry.getKey());

      JsonArray componentArr = new JsonArray();
      for (String comp : entry.getValue()) {
        componentArr.add(new JsonPrimitive(comp));
      }
      hostObj.add("components", componentArr);

      arr.add(hostObj);
    }

    JsonObject obj = new JsonObject();
    obj.add("unhealthy", arr);

    mt.structuredOut = obj.toString();

  }

}
