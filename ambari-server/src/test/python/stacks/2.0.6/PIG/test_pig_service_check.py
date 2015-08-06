#!/usr/bin/env python

'''
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file`
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
'''

from stacks.utils.RMFTestCase import *

class TestPigServiceCheck(RMFTestCase):
  COMMON_SERVICES_PACKAGE_DIR = "PIG/0.12.0.2.0/package"
  STACK_VERSION = "2.0.6"
  
  def test_configure_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/service_check.py",
                       classname = "PigServiceCheck",
                       command = "service_check",
                       config_file="default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('HdfsResource', '/user/ambari-qa/pigsmoke.out',
        security_enabled = False,
        hadoop_bin_dir = '/usr/bin',
        keytab = UnknownConfigurationMock(),
        default_fs = 'hdfs://c6401.ambari.apache.org:8020',
        hdfs_site = self.getConfig()['configurations']['hdfs-site'],
        kinit_path_local = '/usr/bin/kinit',
        principal_name = UnknownConfigurationMock(),
        user = 'hdfs',
        owner = 'ambari-qa',
        hadoop_conf_dir = '/etc/hadoop/conf',
        type = 'directory',
        action = ['delete_on_execute'],
    )
    self.assertResourceCalled('HdfsResource', '/user/ambari-qa/passwd',
        security_enabled = False,
        hadoop_bin_dir = '/usr/bin',
        keytab = UnknownConfigurationMock(),
        source = '/etc/passwd',
        default_fs = 'hdfs://c6401.ambari.apache.org:8020',
        hdfs_site = self.getConfig()['configurations']['hdfs-site'],
        kinit_path_local = '/usr/bin/kinit',
        principal_name = UnknownConfigurationMock(),
        user = 'hdfs',
        owner = 'ambari-qa',
        hadoop_conf_dir = '/etc/hadoop/conf',
        type = 'file',
        action = ['create_on_execute'],
    )
    self.assertResourceCalled('HdfsResource', None,
        security_enabled = False,
        hadoop_bin_dir = '/usr/bin',
        keytab = UnknownConfigurationMock(),
        default_fs = 'hdfs://c6401.ambari.apache.org:8020',
        hdfs_site = self.getConfig()['configurations']['hdfs-site'],
        kinit_path_local = '/usr/bin/kinit',
        principal_name = UnknownConfigurationMock(),
        user = 'hdfs',
        action = ['execute'],
        hadoop_conf_dir = '/etc/hadoop/conf',
    )
       
    self.assertResourceCalled('File', '/tmp/pigSmoke.sh',
      content = StaticFile('pigSmoke.sh'),
      mode = 0755,
    )
       
    self.assertResourceCalled('Execute', 'pig /tmp/pigSmoke.sh',
      path = [':/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
      tries = 3,
      user = 'ambari-qa',
      try_sleep = 5,
      logoutput = True
    )
       
    self.assertResourceCalled('ExecuteHadoop', 'fs -test -e /user/ambari-qa/pigsmoke.out',
      user = 'ambari-qa',
      bin_dir = '/usr/bin',
      conf_dir = '/etc/hadoop/conf',
    )
    self.assertNoMoreResources()

  def test_configure_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/service_check.py",
                       classname = "PigServiceCheck",
                       command = "service_check",
                       config_file="secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    
    self.assertResourceCalled('HdfsResource', '/user/ambari-qa/pigsmoke.out',
        security_enabled = True,
        hadoop_bin_dir = '/usr/bin',
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        default_fs = 'hdfs://c6401.ambari.apache.org:8020',
        hdfs_site = self.getConfig()['configurations']['hdfs-site'],
        kinit_path_local = '/usr/bin/kinit',
        principal_name = 'hdfs',
        user = 'hdfs',
        owner = 'ambari-qa',
        hadoop_conf_dir = '/etc/hadoop/conf',
        type = 'directory',
        action = ['delete_on_execute'],
    )
    self.assertResourceCalled('HdfsResource', '/user/ambari-qa/passwd',
        security_enabled = True,
        hadoop_bin_dir = '/usr/bin',
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        source = '/etc/passwd',
        default_fs = 'hdfs://c6401.ambari.apache.org:8020',
        hdfs_site = self.getConfig()['configurations']['hdfs-site'],
        kinit_path_local = '/usr/bin/kinit',
        principal_name = 'hdfs',
        user = 'hdfs',
        owner = 'ambari-qa',
        hadoop_conf_dir = '/etc/hadoop/conf',
        type = 'file',
        action = ['create_on_execute'],
    )
    self.assertResourceCalled('HdfsResource', None,
        security_enabled = True,
        hadoop_bin_dir = '/usr/bin',
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        default_fs = 'hdfs://c6401.ambari.apache.org:8020',
        hdfs_site = self.getConfig()['configurations']['hdfs-site'],
        kinit_path_local = '/usr/bin/kinit',
        principal_name = 'hdfs',
        user = 'hdfs',
        action = ['execute'],
        hadoop_conf_dir = '/etc/hadoop/conf',
    )
       
    self.assertResourceCalled('File', '/tmp/pigSmoke.sh',
      content = StaticFile('pigSmoke.sh'),
      mode = 0755,
    )
       
    self.assertResourceCalled('Execute', 'pig /tmp/pigSmoke.sh',
      path = [':/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
      tries = 3,
      user = 'ambari-qa',
      try_sleep = 5,
      logoutput = True
    )
       
    self.assertResourceCalled('ExecuteHadoop', 'fs -test -e /user/ambari-qa/pigsmoke.out',
      user = 'ambari-qa',
      bin_dir = '/usr/bin',
      conf_dir = '/etc/hadoop/conf',
    )
    self.assertNoMoreResources()
