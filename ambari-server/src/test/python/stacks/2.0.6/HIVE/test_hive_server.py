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
'''
import socket
import subprocess

from mock.mock import MagicMock, patch
from resource_management.core import shell
from stacks.utils.RMFTestCase import *

class TestHiveServer(RMFTestCase):
  COMMON_SERVICES_PACKAGE_DIR = "HIVE/0.12.0.2.0/package"
  STACK_VERSION = "2.0.6"
  UPGRADE_STACK_VERSION = "2.2"

  def test_configure_default(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                       classname = "HiveServer",
                       command = "configure",
                       config_file="default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_default()
    self.assertNoMoreResources()

  @patch.object(shell, "call", new=MagicMock(return_value=(0, '')))
  @patch.object(subprocess,"Popen")
  @patch("socket.socket")
  def test_start_default(self, socket_mock, popen_mock):
    s = socket_mock.return_value
    
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                         classname = "HiveServer",
                         command = "start",
                         config_file="default.json",
                         hdp_stack_version = self.STACK_VERSION,
                         target = RMFTestCase.TARGET_COMMON_SERVICES
    )

    self.assert_configure_default()
    self.assertResourceCalled('Execute', 'metatool -updateLocation hdfs://c6401.ambari.apache.org:8020/apps/hive/warehouse ',
        environment = {'PATH' : "/bin:/usr/lib/hive/bin:/usr/bin"},
        user = 'hive',
    )
    self.assertResourceCalled('Execute', 'env JAVA_HOME=/usr/jdk64/jdk1.7.0_45 /tmp/start_hiveserver2_script /var/log/hive/hive-server2.out /var/log/hive/hive-server2.log /var/run/hive/hive-server.pid /etc/hive/conf.server /var/log/hive',
                              not_if = 'ls /var/run/hive/hive-server.pid >/dev/null 2>&1 && ps -p `cat /var/run/hive/hive-server.pid` >/dev/null 2>&1',
                              environment = {'HADOOP_HOME' : '/usr'},
                              path = ["/bin:/usr/lib/hive/bin:/usr/bin"],
                              user = 'hive'
    )

    self.assertResourceCalled('Execute', '/usr/jdk64/jdk1.7.0_45/bin/java -cp /usr/lib/ambari-agent/DBConnectionVerification.jar:/usr/share/java/mysql-connector-java.jar org.apache.ambari.server.DBConnectionVerification \'jdbc:mysql://c6402.ambari.apache.org/hive?createDatabaseIfNotExist=true\' hive \'!`"\'"\'"\' 1\' com.mysql.jdbc.Driver',
                              path=['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'], tries=5, try_sleep=10
    )

    self.assertNoMoreResources()
    self.assertTrue(socket_mock.called)
    self.assertTrue(s.close.called)

  @patch("socket.socket")
  def test_stop_default(self, socket_mock):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                       classname = "HiveServer",
                       command = "stop",
                       config_file="default.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )

    self.assertResourceCalled('Execute', 'sudo kill `cat /var/run/hive/hive-server.pid`',
        not_if = '! (ls /var/run/hive/hive-server.pid >/dev/null 2>&1 && ps -p `cat /var/run/hive/hive-server.pid` >/dev/null 2>&1)',
    )
    self.assertResourceCalled('File', '/var/run/hive/hive-server.pid',
        action = ['delete'],
    )
    
    self.assertNoMoreResources()
    self.assertFalse(socket_mock.called)

    
  def test_configure_secured(self):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                       classname = "HiveServer",
                       command = "configure",
                       config_file="secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )
    self.assert_configure_secured()
    self.assertNoMoreResources()

  @patch("hive_service.check_fs_root")
  @patch("socket.socket")
  def test_start_secured(self, socket_mock, check_fs_root_mock):
    s = socket_mock.return_value

    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                       classname = "HiveServer",
                       command = "start",
                       config_file="secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )

    self.assert_configure_secured()
    self.assertResourceCalled('Execute', 'env JAVA_HOME=/usr/jdk64/jdk1.7.0_45 /tmp/start_hiveserver2_script /var/log/hive/hive-server2.out /var/log/hive/hive-server2.log /var/run/hive/hive-server.pid /etc/hive/conf.server /var/log/hive',
                              not_if = 'ls /var/run/hive/hive-server.pid >/dev/null 2>&1 && ps -p `cat /var/run/hive/hive-server.pid` >/dev/null 2>&1',
                              environment = {'HADOOP_HOME' : '/usr'},
                              path = ["/bin:/usr/lib/hive/bin:/usr/bin"],
                              user = 'hive'
    )

    self.assertResourceCalled('Execute', '/usr/jdk64/jdk1.7.0_45/bin/java -cp /usr/lib/ambari-agent/DBConnectionVerification.jar:/usr/share/java/mysql-connector-java.jar org.apache.ambari.server.DBConnectionVerification \'jdbc:mysql://c6402.ambari.apache.org/hive?createDatabaseIfNotExist=true\' hive \'!`"\'"\'"\' 1\' com.mysql.jdbc.Driver',
                              path=['/usr/sbin:/sbin:/usr/local/bin:/bin:/usr/bin'], tries=5, try_sleep=10
    )
    self.assertResourceCalled('Execute', '/usr/bin/kinit -kt /etc/security/keytabs/smokeuser.headless.keytab ambari-qa; ',
                              user = 'ambari-qa',
                              )
    self.assertResourceCalled('Execute', "! beeline -u 'jdbc:hive2://c6402.ambari.apache.org:10000/;principal=hive/_HOST@EXAMPLE.COM' -e '' 2>&1| awk '{print}'|grep -i -e 'Connection refused' -e 'Invalid URL'",
                              path = ['/bin/', '/usr/bin/', '/usr/lib/hive/bin/', '/usr/sbin/'],
                              user = 'ambari-qa',
                              timeout = 30,
                              )
    self.assertNoMoreResources()
    self.assertTrue(check_fs_root_mock.called)

  @patch("socket.socket")
  def test_stop_secured(self, socket_mock):
    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                       classname = "HiveServer",
                       command = "stop",
                       config_file="secured.json",
                       hdp_stack_version = self.STACK_VERSION,
                       target = RMFTestCase.TARGET_COMMON_SERVICES
    )

    self.assertResourceCalled('Execute', 'sudo kill `cat /var/run/hive/hive-server.pid`',
        not_if = '! (ls /var/run/hive/hive-server.pid >/dev/null 2>&1 && ps -p `cat /var/run/hive/hive-server.pid` >/dev/null 2>&1)',
    )
    self.assertResourceCalled('File', '/var/run/hive/hive-server.pid',
        action = ['delete'],
    )
    
    self.assertNoMoreResources()
    self.assertFalse(socket_mock.called)

  def assert_configure_default(self):
    self.assertResourceCalled('HdfsDirectory', '/apps/tez/',
                              action = ['create_delayed'],
                              mode = 0755,
                              owner = 'tez',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              bin_dir = '/usr/bin',
                              kinit_path_local = "/usr/bin/kinit"
    )

    self.assertResourceCalled('HdfsDirectory', '/apps/tez/lib/',
                              action = ['create_delayed'],
                              mode = 0755,
                              owner = 'tez',
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              bin_dir = '/usr/bin',
                              kinit_path_local = "/usr/bin/kinit"
    )
    self.assertResourceCalled('HdfsDirectory', None,
                              security_enabled = False,
                              keytab = UnknownConfigurationMock(),
                              conf_dir = '/etc/hadoop/conf',
                              hdfs_user = 'hdfs',
                              kinit_path_local = '/usr/bin/kinit',
                              bin_dir = '/usr/bin',
                              action = ['create']
    )

    self.assertResourceCalled('CopyFromLocal', '/usr/lib/tez/tez*.jar',
                              mode=0755,
                              owner='tez',
                              dest_dir='/apps/tez/',
                              kinnit_if_needed='',
                              hadoop_conf_dir='/etc/hadoop/conf',
                              hadoop_bin_dir='/usr/bin',
                              hdfs_user='hdfs',
                              dest_file=None
    )

    self.assertResourceCalled('CopyFromLocal', '/usr/lib/tez/lib/*.jar',
                              mode=0755,
                              owner='tez',
                              dest_dir='/apps/tez/lib/',
                              kinnit_if_needed='',
                              hadoop_bin_dir='/usr/bin',
                              hadoop_conf_dir='/etc/hadoop/conf',
                              hdfs_user='hdfs'
    )
    self.assertResourceCalled('HdfsDirectory', '/apps/hive/warehouse',
        security_enabled = False,
        keytab = UnknownConfigurationMock(),
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        mode = 0777,
        owner = 'hive',
        bin_dir = '/usr/bin',
        action = ['create_delayed'],
    )
    self.assertResourceCalled('HdfsDirectory', '/user/hive',
        security_enabled = False,
        keytab = UnknownConfigurationMock(),
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        mode = 0700,
        owner = 'hive',
        bin_dir = '/usr/bin',
        action = ['create_delayed'],
    )
    self.assertResourceCalled('HdfsDirectory', None,
        security_enabled = False,
        keytab = UnknownConfigurationMock(),
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        bin_dir = '/usr/bin',
        action = ['create'],
    )
    self.assertResourceCalled('Directory', '/etc/hive',
        mode = 0755
    )
    self.assertResourceCalled('Directory', '/etc/hive/conf.server',
        owner = 'hive',
        group = 'hadoop',
        recursive = True,
    )
    self.assertResourceCalled('XmlConfig', 'mapred-site.xml',
        group = 'hadoop',
        conf_dir = '/etc/hive/conf.server',
        mode = 0644,
        configuration_attributes = self.getConfig()['configuration_attributes']['mapred-site'],
        owner = 'hive',
        configurations = self.getConfig()['configurations']['mapred-site'],
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-default.xml.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-env.sh.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-exec-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('Directory', '/etc/hive/conf',
        owner = 'hive',
        group = 'hadoop',
        recursive = True,
    )
    self.assertResourceCalled('XmlConfig', 'mapred-site.xml',
        group = 'hadoop',
        conf_dir = '/etc/hive/conf',
        mode = 0644,
        configuration_attributes = self.getConfig()['configuration_attributes']['mapred-site'],
        owner = 'hive',
        configurations = self.getConfig()['configurations']['mapred-site'],
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-default.xml.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-env.sh.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-exec-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('XmlConfig', 'hive-site.xml',
                              group = 'hadoop',
                              conf_dir = '/etc/hive/conf.server',
                              mode = 0644,
                              configuration_attributes = self.getConfig()['configuration_attributes']['hive-site'],
                              owner = 'hive',
                              configurations = self.getConfig()['configurations']['hive-site'],
                              )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-env.sh',
                              content = InlineTemplate(self.getConfig()['configurations']['hive-env']['content']),
                              owner = 'hive',
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Execute', ('cp', '/usr/share/java/mysql-connector-java.jar', '/usr/lib/hive/lib//mysql-connector-java.jar'),
                              path = ['/bin', '/usr/bin/'],
                              creates = '/usr/lib/hive/lib//mysql-connector-java.jar',
                              sudo = True,
                              not_if = 'test -f /usr/lib/hive/lib//mysql-connector-java.jar',
                              )
    self.assertResourceCalled('Execute', '/bin/sh -c \'cd /usr/lib/ambari-agent/ && curl -kf -x "" --retry 5 http://c6401.ambari.apache.org:8080/resources/DBConnectionVerification.jar -o DBConnectionVerification.jar\'',
        environment = {'no_proxy': 'c6401.ambari.apache.org'},
        not_if = '[ -f /usr/lib/ambari-agent/DBConnectionVerification.jar ]',
    )
    self.assertResourceCalled('File', '/tmp/start_hiveserver2_script',
        content = Template('startHiveserver2.sh.j2'),
        mode = 0755,
    )
    self.assertResourceCalled('Directory', '/var/run/hive',
        owner = 'hive',
        group = 'hadoop',
        mode = 0755,
        recursive = True,
    )
    self.assertResourceCalled('Directory', '/var/log/hive',
        owner = 'hive',
        group = 'hadoop',
        mode = 0755,
        recursive = True,
    )
    self.assertResourceCalled('Directory', '/var/lib/hive',
        owner = 'hive',
        group = 'hadoop',
        mode = 0755,
        recursive = True,
    )

  def assert_configure_secured(self):
    self.assertResourceCalled('HdfsDirectory', '/apps/hive/warehouse',
        security_enabled = True,
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        bin_dir = '/usr/bin',
        mode = 0777,
        owner = 'hive',
        action = ['create_delayed'],
    )
    self.assertResourceCalled('HdfsDirectory', '/user/hive',
        security_enabled = True,
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        kinit_path_local = '/usr/bin/kinit',
        mode = 0700,
        bin_dir = '/usr/bin',
        owner = 'hive',
        action = ['create_delayed'],
    )
    self.assertResourceCalled('HdfsDirectory', None,
        security_enabled = True,
        keytab = '/etc/security/keytabs/hdfs.headless.keytab',
        conf_dir = '/etc/hadoop/conf',
        hdfs_user = 'hdfs',
        bin_dir = '/usr/bin',
        kinit_path_local = '/usr/bin/kinit',
        action = ['create'],
    )
    self.assertResourceCalled('Directory', '/etc/hive',
        mode = 0755
    )
    self.assertResourceCalled('Directory', '/etc/hive/conf.server',
        owner = 'hive',
        group = 'hadoop',
        recursive = True,
    )
    self.assertResourceCalled('XmlConfig', 'mapred-site.xml',
        group = 'hadoop',
        conf_dir = '/etc/hive/conf.server',
        mode = 0644,
        configuration_attributes = self.getConfig()['configuration_attributes']['mapred-site'],
        owner = 'hive',
        configurations = self.getConfig()['configurations']['mapred-site'],
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-default.xml.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-env.sh.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-exec-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('Directory', '/etc/hive/conf',
        owner = 'hive',
        group = 'hadoop',
        recursive = True,
    )
    self.assertResourceCalled('XmlConfig', 'mapred-site.xml',
        group = 'hadoop',
        conf_dir = '/etc/hive/conf',
        mode = 0644,
        configuration_attributes = self.getConfig()['configuration_attributes']['mapred-site'],
        owner = 'hive',
        configurations = self.getConfig()['configurations']['mapred-site'],
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-default.xml.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-env.sh.template',
        owner = 'hive',
        group = 'hadoop',
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-exec-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('File', '/etc/hive/conf/hive-log4j.properties',
        content = 'log4jproperties\nline2',
        owner = 'hive',
        group = 'hadoop',
        mode = 0644,
    )
    self.assertResourceCalled('XmlConfig', 'hive-site.xml',
                              group = 'hadoop',
                              conf_dir = '/etc/hive/conf.server',
                              mode = 0644,
                              configuration_attributes = self.getConfig()['configuration_attributes']['hive-site'],
                              owner = 'hive',
                              configurations = self.getConfig()['configurations']['hive-site'],
                              )
    self.assertResourceCalled('File', '/etc/hive/conf.server/hive-env.sh',
                              content = InlineTemplate(self.getConfig()['configurations']['hive-env']['content']),
                              owner = 'hive',
                              group = 'hadoop',
                              )
    self.assertResourceCalled('Execute', ('cp', '/usr/share/java/mysql-connector-java.jar', '/usr/lib/hive/lib//mysql-connector-java.jar'),
                              path = ['/bin', '/usr/bin/'],
                              creates = '/usr/lib/hive/lib//mysql-connector-java.jar',
                              sudo = True,
                              not_if = 'test -f /usr/lib/hive/lib//mysql-connector-java.jar',
                              )
    self.assertResourceCalled('Execute', '/bin/sh -c \'cd /usr/lib/ambari-agent/ && curl -kf -x "" --retry 5 http://c6401.ambari.apache.org:8080/resources/DBConnectionVerification.jar -o DBConnectionVerification.jar\'',
        environment = {'no_proxy': 'c6401.ambari.apache.org'},
        not_if = '[ -f /usr/lib/ambari-agent/DBConnectionVerification.jar ]',
    )
    self.assertResourceCalled('File', '/tmp/start_hiveserver2_script',
        content = Template('startHiveserver2.sh.j2'),
        mode = 0755,
    )
    self.assertResourceCalled('Directory', '/var/run/hive',
        owner = 'hive',
        group = 'hadoop',
        mode = 0755,
        recursive = True,
    )
    self.assertResourceCalled('Directory', '/var/log/hive',
        owner = 'hive',
        group = 'hadoop',
        mode = 0755,
        recursive = True,
    )
    self.assertResourceCalled('Directory', '/var/lib/hive',
        owner = 'hive',
        group = 'hadoop',
        mode = 0755,
        recursive = True,
    )

  @patch("hive_service.check_fs_root")
  @patch("time.time")
  @patch("socket.socket")
  def test_socket_timeout(self, socket_mock, time_mock, check_fs_root_mock):
    s = socket_mock.return_value
    s.connect = MagicMock()    
    s.connect.side_effect = socket.error("")
    
    time_mock.side_effect = [0, 1000, 2000, 3000, 4000]
    
    try:
      self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
                           classname = "HiveServer",
                           command = "start",
                           config_file="default.json",
                           hdp_stack_version = self.STACK_VERSION,
                           target = RMFTestCase.TARGET_COMMON_SERVICES
      )
      
      self.fail("Script failure due to socket error was expected")
    except:
      self.assert_configure_default()
      self.assertFalse(socket_mock.called)
      self.assertFalse(s.close.called)


  @patch("hive_server.HiveServer.pre_rolling_restart")
  @patch("hive_server.HiveServer.start")
  @patch("subprocess.Popen")
  def test_stop_during_upgrade(self, process_mock, hive_server_start_mock,
    hive_server_pre_rolling_mock):

    process_output = 'hive-server2 - 2.2.0.0-2041'

    process = MagicMock()
    process.communicate.return_value = [process_output]
    process.returncode = 0
    process_mock.return_value = process

    self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
     classname = "HiveServer", command = "restart", config_file = "hive-upgrade.json",
     hdp_stack_version = self.UPGRADE_STACK_VERSION,
     target = RMFTestCase.TARGET_COMMON_SERVICES )

    self.assertTrue(process_mock.called)
    self.assertEqual(process_mock.call_count,2)

    self.assertResourceCalled('Execute', 'hive --service hiveserver2 --deregister 2.2.0.0-2041',
      path=['/bin:/usr/hdp/current/hive-server2/bin:/usr/hdp/current/hadoop-client/bin'],
      tries=1, user='hive')

    self.assertResourceCalled('Execute', 'hdp-select set hive-server2 2.2.1.0-2065',)


  @patch("hive_server.HiveServer.pre_rolling_restart")
  @patch("hive_server.HiveServer.start")
  @patch("subprocess.Popen")
  def test_stop_during_upgrade_bad_hive_version(self, process_mock, hive_server_start_mock,
    hive_server_pre_rolling_mock):

    process_output = 'BAD VERSION'

    process = MagicMock()
    process.communicate.return_value = [process_output]
    process.returncode = 0
    process_mock.return_value = process

    try:
      self.executeScript(self.COMMON_SERVICES_PACKAGE_DIR + "/scripts/hive_server.py",
       classname = "HiveServer", command = "restart", config_file = "hive-upgrade.json",
       hdp_stack_version = self.UPGRADE_STACK_VERSION,
       target = RMFTestCase.TARGET_COMMON_SERVICES )

      self.fail("Invalid hive version should have caused an exception")
    except:
      pass

    self.assertNoMoreResources()
