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

package org.apache.ambari.server.controller.internal;

import org.apache.ambari.server.api.services.AmbariMetaInfo;
import org.apache.ambari.server.controller.AmbariManagementController;
import org.apache.ambari.server.controller.StackConfigurationRequest;
import org.apache.ambari.server.controller.StackConfigurationResponse;
import org.apache.ambari.server.controller.StackLevelConfigurationRequest;
import org.apache.ambari.server.controller.StackServiceComponentRequest;
import org.apache.ambari.server.controller.StackServiceComponentResponse;
import org.apache.ambari.server.controller.StackServiceRequest;
import org.apache.ambari.server.controller.StackServiceResponse;
import org.apache.ambari.server.state.DependencyInfo;
import org.apache.ambari.server.topology.Configuration;
import org.easymock.Capture;
import org.easymock.EasyMock;
import org.junit.Test;

import java.util.Collections;
import java.util.Set;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.expect;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.powermock.api.easymock.PowerMock.createNiceMock;
import static org.powermock.api.easymock.PowerMock.replay;

/**
 * Stack unit tests.
 */
public class StackTest {

  @Test
  public void testTestXmlExtensionStrippedOff() throws Exception {
    AmbariManagementController controller = createNiceMock(AmbariManagementController.class);
    AmbariMetaInfo metaInfo = createNiceMock(AmbariMetaInfo.class);
    Capture<Set<StackServiceRequest>> stackServiceRequestCapture = new Capture<Set<StackServiceRequest>>();
    StackServiceResponse stackServiceResponse = createNiceMock(StackServiceResponse.class);
    Capture<Set<StackServiceComponentRequest>> stackComponentRequestCapture = new Capture<Set<StackServiceComponentRequest>>();
    StackServiceComponentResponse stackComponentResponse = createNiceMock(StackServiceComponentResponse.class);
    Capture<Set<StackConfigurationRequest>> stackConfigurationRequestCapture = new Capture<Set<StackConfigurationRequest>>();
    Capture<Set<StackLevelConfigurationRequest>> stackLevelConfigurationRequestCapture = new Capture<Set<StackLevelConfigurationRequest>>();
    StackConfigurationResponse stackConfigurationResponse = EasyMock.createNiceMock(StackConfigurationResponse.class);

    expect(controller.getStackServices(capture(stackServiceRequestCapture))).
        andReturn(Collections.singleton(stackServiceResponse)).anyTimes();

    expect(controller.getAmbariMetaInfo()).andReturn(metaInfo).anyTimes();

    expect(stackServiceResponse.getServiceName()).andReturn("service1").anyTimes();
    expect(stackServiceResponse.getExcludedConfigTypes()).andReturn(Collections.<String>emptySet());

    expect(controller.getStackComponents(capture(stackComponentRequestCapture))).
        andReturn(Collections.singleton(stackComponentResponse)).anyTimes();

    expect(stackComponentResponse.getComponentName()).andReturn("component1").anyTimes();
    expect(stackComponentResponse.getComponentCategory()).andReturn("test-site.xml").anyTimes();

    expect(controller.getStackConfigurations(capture(stackConfigurationRequestCapture))).
        andReturn(Collections.singleton(stackConfigurationResponse)).anyTimes();

    // no stack level configs for this test
    expect(controller.getStackLevelConfigurations(capture(stackLevelConfigurationRequestCapture))).
        andReturn(Collections.<StackConfigurationResponse>emptySet()).anyTimes();

    expect(stackConfigurationResponse.getPropertyName()).andReturn("prop1").anyTimes();
    expect(stackConfigurationResponse.getPropertyValue()).andReturn("prop1Val").anyTimes();
    expect(stackConfigurationResponse.getType()).andReturn("test-site.xml").anyTimes();
    expect(stackConfigurationResponse.getPropertyType()).andReturn(
        Collections.<org.apache.ambari.server.state.PropertyInfo.PropertyType>emptySet()).anyTimes();
    expect(stackConfigurationResponse.getPropertyAttributes()).andReturn(Collections.<String, String>emptyMap()).anyTimes();
    expect(stackConfigurationResponse.isRequired()).andReturn(true).anyTimes();

    expect(metaInfo.getComponentDependencies("test", "1.0", "service1", "component1")).
        andReturn(Collections.<DependencyInfo>emptyList()).anyTimes();


    replay(controller, stackServiceResponse, stackComponentResponse, stackConfigurationResponse, metaInfo);


    Stack stack = new Stack("test", "1.0", controller);
    Configuration configuration = stack.getConfiguration(Collections.singleton("service1"));
    assertEquals("prop1Val", configuration.getProperties().get("test-site").get("prop1"));

    assertEquals("test-site", stack.getRequiredConfigurationProperties("service1").iterator().next().getType());

    // assertions
    StackServiceRequest stackServiceRequest = stackServiceRequestCapture.getValue().iterator().next();
    assertEquals("test", stackServiceRequest.getStackName());
    assertEquals("1.0", stackServiceRequest.getStackVersion());

    StackServiceComponentRequest stackComponentRequest = stackComponentRequestCapture.getValue().iterator().next();
    assertEquals("service1", stackComponentRequest.getServiceName());
    assertEquals("test", stackComponentRequest.getStackName());
    assertEquals("1.0", stackComponentRequest.getStackVersion());
    assertNull(stackComponentRequest.getComponentName());
  }

}
