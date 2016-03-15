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
package org.apache.ambari.server.state.repository;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.File;

import org.apache.ambari.server.state.RepositoryType;
import org.apache.ambari.server.state.ServiceInfo;
import org.apache.ambari.server.state.StackInfo;
import org.apache.commons.io.FileUtils;
import org.junit.Test;

/**
 * Tests for repository definitions.
 */
public class VersionDefinitionTest {

  private static File file = new File("src/test/resources/version_definition_test.xml");

  @Test
  public void testLoadingString() throws Exception {
    String xmlString = FileUtils.readFileToString(file);
    VersionDefinitionXml xml = VersionDefinitionXml.load(xmlString);

    validateXml(xml);
  }

  @Test
  public void testLoadingUrl() throws Exception {
    VersionDefinitionXml xml = VersionDefinitionXml.load(file.toURI().toURL());

    validateXml(xml);
  }

  private void validateXml(VersionDefinitionXml xml) throws Exception {
    assertNotNull(xml.release);
    assertEquals(RepositoryType.PATCH, xml.release.repositoryType);
    assertEquals("HDP-2.3", xml.release.stackId);
    assertEquals("2.3.4.1", xml.release.version);
    assertEquals("2.3.4.[1-9]", xml.release.compatibleWith);
    assertEquals("http://docs.hortonworks.com/HDPDocuments/HDP2/HDP-2.3.4/", xml.release.releaseNotes);

    assertEquals(4, xml.manifestServices.size());
    assertEquals("HDFS-271", xml.manifestServices.get(0).serviceId);
    assertEquals("HDFS", xml.manifestServices.get(0).serviceName);
    assertEquals("2.7.1", xml.manifestServices.get(0).version);
    assertEquals("10", xml.manifestServices.get(0).versionId);

    assertEquals(3, xml.availableServices.size());
    assertEquals("HDFS-271", xml.availableServices.get(0).serviceIdReference);
    assertEquals(0, xml.availableServices.get(0).components.size());

    assertEquals("HIVE-110", xml.availableServices.get(2).serviceIdReference);
    assertEquals(1, xml.availableServices.get(2).components.size());

    assertNotNull(xml.repositoryInfo);
    assertEquals(2, xml.repositoryInfo.getOses().size());

    assertEquals("redhat6", xml.repositoryInfo.getOses().get(0).getFamily());
    assertEquals(2, xml.repositoryInfo.getOses().get(0).getRepos().size());
    assertEquals("http://public-repo-1.hortonworks.com/HDP/centos6/2.x/updates/2.3.0.0",
        xml.repositoryInfo.getOses().get(0).getRepos().get(0).getBaseUrl());
    assertEquals("HDP-2.3", xml.repositoryInfo.getOses().get(0).getRepos().get(0).getRepoId());
    assertEquals("HDP", xml.repositoryInfo.getOses().get(0).getRepos().get(0).getRepoName());
  }

  @Test
  public void testAllServices() throws Exception {

    File f = new File("src/test/resources/version_definition_test_all_services.xml");

    VersionDefinitionXml xml = VersionDefinitionXml.load(f.toURI().toURL());

    StackInfo stack = new StackInfo() {
      @Override
      public ServiceInfo getService(String name) {
        return null;
      }
    };

    // the file does not define available services, which
    assertEquals(4, xml.manifestServices.size());
    assertEquals(3, xml.getAvailableServices(stack).size());
  }


}
