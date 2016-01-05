/*
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

package org.apache.ambari.server.upgrade;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import com.google.inject.Inject;
import com.google.inject.Injector;
import org.apache.ambari.server.AmbariException;
import org.apache.ambari.server.controller.AmbariManagementController;
import org.apache.ambari.server.orm.dao.AlertDefinitionDAO;
import org.apache.ambari.server.orm.dao.DaoUtils;
import org.apache.ambari.server.orm.entities.AlertDefinitionEntity;
import org.apache.ambari.server.state.Cluster;
import org.apache.ambari.server.state.Clusters;
import org.apache.ambari.server.state.Config;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Upgrade catalog for version 2.2.1.
 */
public class UpgradeCatalog221 extends AbstractUpgradeCatalog {

  private static final String AMS_HBASE_SITE = "ams-hbase-site";
  private static final String AMS_HBASE_SECURITY_SITE = "ams-hbase-security-site";
  private static final String AMS_ENV = "ams-env";
  private static final String AMS_HBASE_ENV = "ams-hbase-env";
  private static final String ZK_ZNODE_PARENT = "zookeeper.znode.parent";
  private static final String ZK_CLIENT_PORT = "hbase.zookeeper.property.clientPort";
  private static final String CLUSTER_ENV = "cluster-env";
  private static final String SECURITY_ENABLED = "security_enabled";

  @Inject
  DaoUtils daoUtils;

  /**
   * Logger.
   */
  private static final Logger LOG = LoggerFactory.getLogger(UpgradeCatalog221.class);

  private static final String OOZIE_SITE_CONFIG = "oozie-site";
  private static final String OOZIE_SERVICE_HADOOP_CONFIGURATIONS_PROPERTY_NAME = "oozie.service.HadoopAccessorService.hadoop.configurations";
  private static final String OLD_DEFAULT_HADOOP_CONFIG_PATH = "/etc/hadoop/conf";
  private static final String NEW_DEFAULT_HADOOP_CONFIG_PATH = "{{hadoop_conf_dir}}";


  // ----- Constructors ------------------------------------------------------

  /**
   * Don't forget to register new UpgradeCatalogs in {@link org.apache.ambari.server.upgrade.SchemaUpgradeHelper.UpgradeHelperModule#configure()}
   *
   * @param injector Guice injector to track dependencies and uses bindings to inject them.
   */
  @Inject
  public UpgradeCatalog221(Injector injector) {
    super(injector);
    this.injector = injector;
  }

  // ----- UpgradeCatalog ----------------------------------------------------

  /**
   * {@inheritDoc}
   */
  @Override
  public String getTargetVersion() {
    return "2.2.1";
  }

  // ----- AbstractUpgradeCatalog --------------------------------------------

  /**
   * {@inheritDoc}
   */
  @Override
  public String getSourceVersion() {
    return "2.2.0";
  }


  @Override
  protected void executeDDLUpdates() throws AmbariException, SQLException {
    // indices to improve request status calc performance
    dbAccessor.createIndex("idx_stage_request_id", "stage", "request_id");
    dbAccessor.createIndex("idx_hrc_request_id", "host_role_command", "request_id");
    dbAccessor.createIndex("idx_rsc_request_id", "role_success_criteria", "request_id");

  }

  @Override
  protected void executePreDMLUpdates() throws AmbariException, SQLException {
    //To change body of implemented methods use File | Settings | File Templates.
  }

  @Override
  protected void executeDMLUpdates() throws AmbariException, SQLException {
    addNewConfigurationsFromXml();
    updateAlerts();
    updateOozieConfigs();
  }

  protected void updateAlerts() {
    LOG.info("Updating alert definitions.");
    AmbariManagementController ambariManagementController = injector.getInstance(AmbariManagementController.class);
    AlertDefinitionDAO alertDefinitionDAO = injector.getInstance(AlertDefinitionDAO.class);
    Clusters clusters = ambariManagementController.getClusters();

    Map<String, Cluster> clusterMap = getCheckedClusterMap(clusters);
    for (final Cluster cluster : clusterMap.values()) {
      long clusterID = cluster.getClusterId();
      final AlertDefinitionEntity hiveMetastoreProcessAlertDefinitionEntity = alertDefinitionDAO.findByName(
              clusterID, "hive_metastore_process");
      final AlertDefinitionEntity hiveServerProcessAlertDefinitionEntity = alertDefinitionDAO.findByName(
              clusterID, "hive_server_process");

      List<AlertDefinitionEntity> hiveAlertDefinitions = new ArrayList();
      if(hiveMetastoreProcessAlertDefinitionEntity != null) {
        hiveAlertDefinitions.add(hiveMetastoreProcessAlertDefinitionEntity);
      }
      if(hiveServerProcessAlertDefinitionEntity != null) {
        hiveAlertDefinitions.add(hiveServerProcessAlertDefinitionEntity);
      }

      for(AlertDefinitionEntity alertDefinition : hiveAlertDefinitions){
        String source = alertDefinition.getSource();

        alertDefinition.setScheduleInterval(3);
        alertDefinition.setSource(addCheckCommandTimeoutParam(source));
        alertDefinition.setHash(UUID.randomUUID().toString());

        alertDefinitionDAO.merge(alertDefinition);
      }

    }
  }

  protected String addCheckCommandTimeoutParam(String source) {
    JsonObject sourceJson = new JsonParser().parse(source).getAsJsonObject();
    JsonArray parametersJson = sourceJson.getAsJsonArray("parameters");

    boolean parameterExists = parametersJson != null && !parametersJson.isJsonNull();

    if (parameterExists) {
      Iterator<JsonElement> jsonElementIterator = parametersJson.iterator();
      while(jsonElementIterator.hasNext()) {
        JsonElement element = jsonElementIterator.next();
        JsonElement name = element.getAsJsonObject().get("name");
        if (name != null && !name.isJsonNull() && name.getAsString().equals("check.command.timeout")) {
          return sourceJson.toString();
        }
      }
    }

    JsonObject checkCommandTimeoutParamJson = new JsonObject();
    checkCommandTimeoutParamJson.add("name", new JsonPrimitive("check.command.timeout"));
    checkCommandTimeoutParamJson.add("display_name", new JsonPrimitive("Check command timeout"));
    checkCommandTimeoutParamJson.add("value", new JsonPrimitive(60.0));
    checkCommandTimeoutParamJson.add("type", new JsonPrimitive("NUMERIC"));
    checkCommandTimeoutParamJson.add("description", new JsonPrimitive("The maximum time before check command will be killed by timeout"));
    checkCommandTimeoutParamJson.add("units", new JsonPrimitive("seconds"));

    if (!parameterExists) {
      parametersJson = new JsonArray();
      parametersJson.add(checkCommandTimeoutParamJson);
      sourceJson.add("parameters", parametersJson);
    } else {
      parametersJson.add(checkCommandTimeoutParamJson);
      sourceJson.remove("parameters");
      sourceJson.add("parameters", parametersJson);
    }

    return sourceJson.toString();
  }

  protected void updateAMSConfigs() throws AmbariException {
    AmbariManagementController ambariManagementController = injector.getInstance(AmbariManagementController.class);
    Clusters clusters = ambariManagementController.getClusters();

    if (clusters != null) {
      Map<String, Cluster> clusterMap = clusters.getClusters();

      if (clusterMap != null && !clusterMap.isEmpty()) {
        for (final Cluster cluster : clusterMap.values()) {

          Config amsEnv = cluster.getDesiredConfigByType(AMS_ENV);
          if (amsEnv != null) {
            Map<String, String> amsEnvProperties = amsEnv.getProperties();
            String content = amsEnvProperties.get("content");
            Map<String, String> newProperties = new HashMap<>();
            newProperties.put("content", updateAmsEnvContent(content));
            updateConfigurationPropertiesForCluster(cluster, AMS_ENV, newProperties, true, true);
          }

          String znodeParent = null;
          Config amsHbaseSecuritySite = cluster.getDesiredConfigByType(AMS_HBASE_SECURITY_SITE);
          if (amsHbaseSecuritySite != null) {
            Map<String, String> amsHbaseSecuritySiteProperties = amsHbaseSecuritySite.getProperties();
            znodeParent = amsHbaseSecuritySiteProperties.get(ZK_ZNODE_PARENT);
            LOG.info("Removing config zookeeper.znode.parent from ams-hbase-security-site");
            removeConfigurationPropertiesFromCluster(cluster, AMS_HBASE_SECURITY_SITE, Collections.singleton(ZK_ZNODE_PARENT));
          }

          Config amsHbaseSite = cluster.getDesiredConfigByType(AMS_HBASE_SITE);
          if (amsHbaseSite != null) {
            Map<String, String> amsHbaseSiteProperties = amsHbaseSite.getProperties();
            Map<String, String> newProperties = new HashMap<>();

            if (!amsHbaseSiteProperties.containsKey(ZK_ZNODE_PARENT)) {
              if (StringUtils.isEmpty(znodeParent) || "/hbase".equals(znodeParent)) {
                boolean isSecurityEnabled = false;
                Config clusterEnv = cluster.getDesiredConfigByType(CLUSTER_ENV);
                if (clusterEnv != null) {
                  Map<String,String> clusterEnvProperties = clusterEnv.getProperties();
                  if (clusterEnvProperties.containsKey(SECURITY_ENABLED)) {
                    isSecurityEnabled = Boolean.valueOf(clusterEnvProperties.get(SECURITY_ENABLED));
                  }
                }
                znodeParent = "/ams-hbase-" + (isSecurityEnabled ? "secure" : "unsecure");
              }

              LOG.info("Adding config zookeeper.znode.parent=" + znodeParent + " to ams-hbase-site");
              newProperties.put(ZK_ZNODE_PARENT, znodeParent);

            }
            if (amsHbaseSiteProperties.containsKey(ZK_CLIENT_PORT)) {
              String newValue = "{{zookeeper_clientPort}}";
              LOG.info("Replacing value of hbase.zookeeper.property.clientPort from " +
                amsHbaseSiteProperties.get(ZK_CLIENT_PORT) + " to " + newValue);

              newProperties.put(ZK_CLIENT_PORT, newValue);
            }
            updateConfigurationPropertiesForCluster(cluster, AMS_HBASE_SITE, newProperties, true, true);
          }

          Config amsHbaseEnv = cluster.getDesiredConfigByType(AMS_HBASE_ENV);
          if (amsHbaseEnv != null) {
            Map<String, String> amsHbaseEnvProperties = amsHbaseEnv.getProperties();
            String content = amsHbaseEnvProperties.get("content");
            Map<String, String> newProperties = new HashMap<>();
            newProperties.put("content", updateAmsHbaseEnvContent(content));
            updateConfigurationPropertiesForCluster(cluster, AMS_HBASE_ENV, newProperties, true, true);
          }
        }
      }
    }
  }

  protected String updateAmsHbaseEnvContent(String content) {
    if (content == null) {
      return null;
    }
    String regSearch = "_jaas_config_file\\}\\} -Dzookeeper.sasl.client.username=\\{\\{zk_servicename\\}\\}";
    String replacement = "_jaas_config_file}}";
    content = content.replaceAll(regSearch, replacement);
    return content;
  }

  protected String updateAmsEnvContent(String content) {

    if (content == null) {
      return null;
    }
    String regSearch = "-Djava.security.auth.login.config=\\{\\{ams_collector_jaas_config_file\\}\\} " +
      "-Dzookeeper.sasl.client.username=\\{\\{zk_servicename\\}\\}";
    String replacement = "-Djava.security.auth.login.config={{ams_collector_jaas_config_file}}";
    content = content.replaceAll(regSearch, replacement);

    return content;
  }

  protected void updateOozieConfigs() throws AmbariException {
    AmbariManagementController ambariManagementController = injector.getInstance(AmbariManagementController.class);
    for (final Cluster cluster : getCheckedClusterMap(ambariManagementController.getClusters()).values()) {
      Config oozieSiteProps = cluster.getDesiredConfigByType(OOZIE_SITE_CONFIG);
      if (oozieSiteProps != null) {
        // Update oozie.service.HadoopAccessorService.hadoop.configurations
        Map<String, String> updateProperties = new HashMap<>();
        String oozieHadoopConfigProperty = oozieSiteProps.getProperties().get(OOZIE_SERVICE_HADOOP_CONFIGURATIONS_PROPERTY_NAME);
        if(oozieHadoopConfigProperty != null && oozieHadoopConfigProperty.contains(OLD_DEFAULT_HADOOP_CONFIG_PATH)) {
          String updatedOozieHadoopConfigProperty = oozieHadoopConfigProperty.replaceAll(
              OLD_DEFAULT_HADOOP_CONFIG_PATH, NEW_DEFAULT_HADOOP_CONFIG_PATH);
          updateProperties.put(OOZIE_SERVICE_HADOOP_CONFIGURATIONS_PROPERTY_NAME, updatedOozieHadoopConfigProperty);
          updateConfigurationPropertiesForCluster(cluster, OOZIE_SITE_CONFIG, updateProperties, true, false);
        }
      }
    }
  }

}
