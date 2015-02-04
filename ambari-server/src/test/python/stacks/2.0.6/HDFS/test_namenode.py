#!/usr/bin/env python

'''
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
from ambari_commons import OSCheck
'''
from stacks.utils.RMFTestCase import *
from ambari_commons import OSCheck
from mock.mock import MagicMock, patch
import resource_management
from resource_management.core import shell

import subprocess

@patch.object(shell, "call", new=MagicMock(return_value=(1,"")))
class TestNamenode(RMFTestCase):
  COMMON_SERVICES_PACKAGE_DIR = "HDFS/2.1.0.2.0/package"
  STACK_VERSION = "2.0.6"

  def test_configure_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "configure",
                       config_file = "default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_default()
    self.assertNoMoreResources()

  def test_start_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "start",
                       config_file = "default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_default()
    self.assertResourceCalled('Execute', 'sudo ls /hadoop/hdfs/namenode | wc -l  | grep -q ^0$',
                              path = ['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
                              )
    self.assertResourceCalled('Execute', 'sudo su hdfs - -s /bin/bash -c "export PATH=$PATH:/usr/bin ; yes Y | hdfs --config /etc/hadoop/conf namenode -format"',
                              path = ['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
                              )
    self.assertResourceCalled('Directory', '/hadoop/hdfs/namenode/namenode-formatted/',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop',
                              owner = 'hdfs',
                              group = 'hadoop',
                              mode = 0755
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('Directory', '/var/log/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf start namenode'",
        environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
        not_if = 'ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
    )
    self.assertResourceCalled('Execute', 'hdfs --config /etc/hadoop/conf dfsadmin -safemode leave',
        path = ['/usr/bin'],
        user = 'hdfs',
    )
    self.assertResourceCalled('Execute', "hadoop dfsadmin -safemode get | grep 'Safe mode is OFF'",
        path = ['/usr/bin'],
        tries = 40,
        only_if = None,
        user = 'hdfs',
        try_sleep = 10,
    )
    self.assertResourceCalled('HdfsDirectory', '/tmp',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0777,
                              owner = 'hdfs',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', '/user/ambari-qa',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0770,
                              owner = 'ambari-qa',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', None,
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              action = ['create'],
                              bin_dir = '/usr/bin',
                              only_if = None,
                              )
    self.assertNoMoreResources()

  def test_stop_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "stop",
                       config_file = "default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf stop namenode'",
        environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
        not_if = None,
    )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              )
    self.assertNoMoreResources()

  def test_configure_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "configure",
                       config_file = "secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_secured()
    self.assertNoMoreResources()

  def test_start_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "start",
                       config_file = "secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_secured()
    self.assertResourceCalled('Execute', 'sudo ls /hadoop/hdfs/namenode | wc -l  | grep -q ^0$',
                              path = ['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
                              )
    self.assertResourceCalled('Execute', 'sudo su hdfs - -s /bin/bash -c "export PATH=$PATH:/usr/bin ; yes Y | hdfs --config /etc/hadoop/conf namenode -format"',
                              path = ['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
                              )
    self.assertResourceCalled('Directory', '/hadoop/hdfs/namenode/namenode-formatted/',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop',
                              owner = 'hdfs',
                              group = 'hadoop',
                              mode = 0755
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('Directory', '/var/log/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf start namenode'",
        environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
        not_if = 'ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
    )
    self.assertResourceCalled('Execute', '/usr/bin/kinit -kt /etc/security/keytabs/hdfs.headless.keytab hdfs',
                              user='hdfs',
                              )
    self.assertResourceCalled('Execute', 'hdfs --config /etc/hadoop/conf dfsadmin -safemode leave',
        path = ['/usr/bin'],
        user = 'hdfs',
    )
    self.assertResourceCalled('Execute', "hadoop dfsadmin -safemode get | grep 'Safe mode is OFF'",
        path = ['/usr/bin'],
        tries = 40,
        only_if = None,
        user = 'hdfs',
        try_sleep = 10,
    )
    self.assertResourceCalled('HdfsDirectory', '/tmp',
                              security_enabled = True,
                              keytab = '/etc/security/keytabs/hdfs.headless.keytab',
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0777,
                              owner = 'hdfs',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', '/user/ambari-qa',
                              security_enabled = True,
                              keytab = '/etc/security/keytabs/hdfs.headless.keytab',
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0770,
                              owner = 'ambari-qa',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', None,
                              security_enabled = True,
                              keytab = '/etc/security/keytabs/hdfs.headless.keytab',
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              action = ['create'],
                              bin_dir = '/usr/bin',
                              only_if = None,
                              )
    self.assertNoMoreResources()

  def test_stop_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "stop",
                       config_file = "secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf stop namenode'",
        environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
        not_if = None,
    )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              )
    self.assertNoMoreResources()

  def test_start_ha_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "start",
                       config_file = "ha_default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_default()
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop',
                              owner = 'hdfs',
                              group = 'hadoop',
                              mode = 0755
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('Directory', '/var/log/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf start namenode'",
        environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
        not_if = 'ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
    )
    self.assertResourceCalled('Execute', "hadoop dfsadmin -safemode get | grep 'Safe mode is OFF'",
        path = ['/usr/bin'],
        tries = 40,
        only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn1 | grep active'",
        user = 'hdfs',
        try_sleep = 10,
    )
    self.assertResourceCalled('HdfsDirectory', '/tmp',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0777,
                              owner = 'hdfs',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', '/user/ambari-qa',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0770,
                              owner = 'ambari-qa',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', None,
        security_enabled = False,
        keytab = UnknownConfigurationMock(),
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        action = ['create'],
        bin_dir = '/usr/bin',
        only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn1 | grep active'",
    )
    self.assertNoMoreResources()

  def test_start_ha_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "start",
                       config_file = "ha_secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_secured()
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop',
                              owner = 'hdfs',
                              group = 'hadoop',
                              mode = 0755
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('Directory', '/var/log/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf start namenode'",
        environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
        not_if = 'ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
    )
    self.assertResourceCalled('Execute', '/usr/bin/kinit -kt /etc/security/keytabs/hdfs.headless.keytab hdfs',
        user = 'hdfs',
    )
    self.assertResourceCalled('Execute', "hadoop dfsadmin -safemode get | grep 'Safe mode is OFF'",
        path = ['/usr/bin'],
        tries = 40,
        only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn1 | grep active'",
        user = 'hdfs',
        try_sleep = 10,
    )
    self.assertResourceCalled('HdfsDirectory', '/tmp',
                              security_enabled = True,
                              keytab = '/etc/security/keytabs/hdfs.headless.keytab',
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0777,
                              owner = 'hdfs',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', '/user/ambari-qa',
                              security_enabled = True,
                              keytab = '/etc/security/keytabs/hdfs.headless.keytab',
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0770,
                              owner = 'ambari-qa',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', None,
        security_enabled = True,
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        action = ['create'],
        bin_dir = '/usr/bin',
        only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn1 | grep active'",
    )
    self.assertNoMoreResources()

  # tests namenode start command when NameNode HA is enabled, and
  # the HA cluster is started initially, rather than using the UI Wizard
  def test_start_ha_bootstrap_active_from_blueprint(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "start",
                       config_file="ha_bootstrap_active_node.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_default()

    # verify that active namenode was formatted
    self.assertResourceCalled('Execute', 'sudo su hdfs - -s /bin/bash -c "export PATH=$PATH:/usr/bin ; yes Y | hdfs --config /etc/hadoop/conf namenode -format"',
                              path = ['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'],
                              )
    self.assertResourceCalled('Directory', '/hadoop/hdfs/namenode/namenode-formatted/',
                              recursive = True,
                              )

    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop',
                              owner = 'hdfs',
                              group = 'hadoop',
                              mode = 0755
    )
    self.assertResourceCalled('Directory', '/var/run/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('Directory', '/var/log/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf start namenode'",
                              environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
                              not_if = 'ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "hadoop dfsadmin -safemode get | grep 'Safe mode is OFF'",
                              path = ['/usr/bin'],
                              tries = 40,
                              only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn1 | grep active'",
                              user = 'hdfs',
                              try_sleep = 10,
                              )
    self.assertResourceCalled('HdfsDirectory', '/tmp',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0777,
                              owner = 'hdfs',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', '/user/ambari-qa',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0770,
                              owner = 'ambari-qa',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', None,
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              action = ['create'],
                              bin_dir = '/usr/bin',
                              only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn1 | grep active'",
                              )
    self.assertNoMoreResources()

  # tests namenode start command when NameNode HA is enabled, and
  # the HA cluster is started initially, rather than using the UI Wizard
  # this test verifies the startup of a "standby" namenode
  def test_start_ha_bootstrap_standby_from_blueprint(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "start",
                       config_file="ha_bootstrap_standby_node.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_default()

    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Directory', '/var/run/hadoop',
                              owner = 'hdfs',
                              group = 'hadoop',
                              mode = 0755
    )

    # verify that the standby case is detected, and that the bootstrap
    # command is run before the namenode launches
    self.assertResourceCalled('Execute', 'hdfs namenode -bootstrapStandby',
                              user = 'hdfs', tries=50)

    self.assertResourceCalled('Directory', '/var/run/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('Directory', '/var/log/hadoop/hdfs',
                              owner = 'hdfs',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid',
                              action = ['delete'],
                              not_if='ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c '[RMF_EXPORT_PLACEHOLDER]ulimit -c unlimited ;  /usr/lib/hadoop/sbin/hadoop-daemon.sh --config /etc/hadoop/conf start namenode'",
                              environment = {'HADOOP_LIBEXEC_DIR': '/usr/lib/hadoop/libexec'},
                              not_if = 'ls /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid >/dev/null 2>&1 && ps -p `cat /var/run/hadoop/hdfs/hadoop-hdfs-namenode.pid` >/dev/null 2>&1',
                              )
    self.assertResourceCalled('Execute', "hadoop dfsadmin -safemode get | grep 'Safe mode is OFF'",
                              path = ['/usr/bin'],
                              tries = 40,
                              only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn2 | grep active'",
                              user = 'hdfs',
                              try_sleep = 10,
                              )
    self.assertResourceCalled('HdfsDirectory', '/tmp',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0777,
                              owner = 'hdfs',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', '/user/ambari-qa',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              mode = 0770,
                              owner = 'ambari-qa',
                              bin_dir = '/usr/bin',
                              action = ['create_delayed'],
                              )
    self.assertResourceCalled('HdfsDirectory', None,
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              action = ['create'],
                              bin_dir = '/usr/bin',
                              only_if = "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf haadmin -getServiceState nn2 | grep active'",
                              )
    self.assertNoMoreResources()

  def test_decommission_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "decommission",
                       config_file = "default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Execute', '', user = 'hdfs')
    self.assertResourceCalled('ExecuteHadoop', 'dfsadmin -refreshNodes',
                              user = 'hdfs',
                              conf_dir = '/etc/hadoop/conf',
                              bin_dir = '/usr/bin',
                              kinit_override = True)
    self.assertNoMoreResources()

  def test_decommission_update_exclude_file_only(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "decommission",
                       config_file = "default_update_exclude_file_only.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertNoMoreResources()


  def test_decommission_ha_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "decommission",
                       config_file = "ha_default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
                              owner = 'hdfs',
                              content = Template('exclude_hosts_list.j2'),
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Execute', '', user = 'hdfs')
    self.assertResourceCalled('ExecuteHadoop', 'dfsadmin -fs hdfs://c6401.ambari.apache.org:8020 -refreshNodes',
                              user = 'hdfs',
                              conf_dir = '/etc/hadoop/conf',
                              bin_dir = '/usr/bin',
                              kinit_override = True)
    self.assertNoMoreResources()


  def test_decommission_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                       classname = "NameNode",
                       command = "decommission",
                       config_file = "secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assertResourceCalled('File', '/etc/hadoop/conf/dfs.exclude',
        owner = 'hdfs',
        content = Template('exclude_hosts_list.j2'),
        group = 'hadoop',
    )
    self.assertResourceCalled('Execute', '/usr/bin/kinit -kt /etc/security/keytabs/nn.service.keytab nn/c6401.ambari.apache.org@EXAMPLE.COM;',
        user = 'hdfs',
    )
    self.assertResourceCalled('ExecuteHadoop', 'dfsadmin -refreshNodes',
        bin_dir = '/usr/bin',
        conf_dir = '/etc/hadoop/conf',
        kinit_override = True,
        user = 'hdfs',
    )
    self.assertNoMoreResources()

  def assert_configure_default(self):
    self.assertResourceCalled('Directory', '/etc/security/limits.d',
                              owner = 'root',
                              group = 'root',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/etc/security/limits.d/hdfs.conf',
                              content = Template('hdfs.conf.j2'),
                              owner = 'root',
                              group = 'root',
                              mode = 0644,
                              )
    self.assertResourceCalled('XmlConfig', 'hdfs-site.xml',
                              owner = 'hdfs',
                              group = 'hadoop',
                              conf_dir = '/etc/hadoop/conf',
                              configurations = self.getConfig()['configurations']['hdfs-site'],
                              configuration_attributes = self.getConfig()['configuration_attributes']['hdfs-site']
                              )
    self.assertResourceCalled('XmlConfig', 'core-site.xml',
                              owner = 'hdfs',
                              group = 'hadoop',
                              conf_dir = '/etc/hadoop/conf',
                              configurations = self.getConfig()['configurations']['core-site'],
                              configuration_attributes = self.getConfig()['configuration_attributes']['core-site'],
                              mode = 0644
                              )
    self.assertResourceCalled('File', '/etc/hadoop/conf/slaves',
                              content = Template('slaves.j2'),
                              owner = 'hdfs',
                              )
    self.assertResourceCalled('Directory', '/hadoop/hdfs/namenode',
                              owner = 'hdfs',
                              group = 'hadoop',
                              recursive = True,
                              mode = 0755,
                              cd_access='a'
                              )

  def assert_configure_secured(self):
    self.assertResourceCalled('Directory', '/etc/security/limits.d',
                              owner = 'root',
                              group = 'root',
                              recursive = True,
                              )
    self.assertResourceCalled('File', '/etc/security/limits.d/hdfs.conf',
                              content = Template('hdfs.conf.j2'),
                              owner = 'root',
                              group = 'root',
                              mode = 0644,
                              )
    self.assertResourceCalled('XmlConfig', 'hdfs-site.xml',
                              owner = 'hdfs',
                              group = 'hadoop',
                              conf_dir = '/etc/hadoop/conf',
                              configurations = self.getConfig()['configurations']['hdfs-site'],
                              configuration_attributes = self.getConfig()['configuration_attributes']['hdfs-site']
                              )
    self.assertResourceCalled('XmlConfig', 'core-site.xml',
                              owner = 'hdfs',
                              group = 'hadoop',
                              conf_dir = '/etc/hadoop/conf',
                              configurations = self.getConfig()['configurations']['core-site'],
                              configuration_attributes = self.getConfig()['configuration_attributes']['core-site'],
                              mode = 0644
                              )
    self.assertResourceCalled('File', '/etc/hadoop/conf/slaves',
                              content = Template('slaves.j2'),
                              owner = 'root',
                              )
    self.assertResourceCalled('Directory', '/hadoop/hdfs/namenode',
                              owner = 'hdfs',
                              group = 'hadoop',
                              recursive = True,
                              mode = 0755,
                              cd_access='a'
                              )

  @patch("resource_management.libraries.script.Script.put_structured_out")
  def test_rebalance_hdfs(self, pso):
      self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/namenode.py",
                         classname = "NameNode",
                         command = "rebalancehdfs",
                         config_file = "rebalancehdfs_default.json",
                         hdp_stack_version = self.STACK_VERSION,
                         target = RMFTestCase.TARGET_COMMON_SERVICES
      )
      self.assertResourceCalled('Execute', "/usr/bin/sudo su hdfs -l -s /bin/bash -c 'export  PATH=/bin:/usr/bin ; hdfs --config /etc/hadoop/conf balancer -threshold -1'",
          logoutput = False,
          on_new_line = FunctionMock('handle_new_line'),
      )
      self.assertNoMoreResources()

class Popen_Mock:
  return_value = 1
  lines = ['Time Stamp               Iteration#  Bytes Already Moved  Bytes Left To Move  Bytes Being Moved\n',
       'Jul 28, 2014 5:01:49 PM           0                  0 B             5.74 GB            9.79 GB\n',
       'Jul 28, 2014 5:03:00 PM           1                  0 B             5.58 GB            9.79 GB\n',
       '']
  def __call__(self, *args,**kwargs):
    popen = MagicMock()
    popen.returncode = Popen_Mock.return_value
    popen.stdout.readline = MagicMock(side_effect = Popen_Mock.lines)
    return popen
