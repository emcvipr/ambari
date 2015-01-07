#!/usr/bin/env python
"""
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

"""

from functions import calc_xmn_from_xms
from resource_management import *
import status_params

# server configurations
config = Script.get_config()
exec_tmp_dir = Script.get_tmp_dir()

#AMS data
ams_user=status_params.ams_user
ams_pid_dir="/var/run/ambari-metrics"

ams_collector_script = "/usr/sbin/ambari-metrics-collector"
ams_collector_conf_dir = "/etc/ambari-metrics-collector/conf"
ams_collector_pid_dir = status_params.ams_collector_pid_dir
ams_collector_hosts = default("/clusterHostInfo/metric_collector_hosts", [])
ams_collector_host_single = ams_collector_hosts[0] #TODO cardinality is 1+ so we can have more than one host
metric_collector_port = default("/configurations/ams-site/timeline.metrics.service.webapp.address", "0.0.0.0:8188")
if metric_collector_port and metric_collector_port.find(':') != -1:
  metric_collector_port = metric_collector_port.split(':')[1]
pass


ams_monitor_conf_dir = "/etc/ambari-metrics-monitor/conf/"
ams_monitor_dir = "/usr/lib/python2.6/site-packages/resource_monitoring"
ams_monitor_pid_dir = status_params.ams_monitor_pid_dir
ams_monitor_script = "/usr/sbin/ambari-metrics-monitor"

#RPM versioning support
rpm_version = default("/configurations/hadoop-env/rpm_version", None)

#hadoop params
if rpm_version is not None:
#RPM versioning support
  rpm_version = default("/configurations/hadoop-env/rpm_version", None)

#hadoop params
if rpm_version is not None:
  hadoop_native_lib = format("/usr/hdp/current/hadoop-client/lib/native/")
  hadoop_bin_dir = format("/usr/hdp/current/hadoop/bin")
  daemon_script = format('/usr/hdp/current/hbase/bin/hbase-daemon.sh')
  region_mover = format('/usr/hdp/current/hbase/bin/region_mover.rb')
  region_drainer = format('/usr/hdp/current/hbase/bin/draining_servers.rb')
  hbase_cmd = format('/usr/hdp/current/hbase/bin/hbase')
else:
  hadoop_native_lib = format("/usr/lib/hadoop/lib/native")
  hadoop_bin_dir = "/usr/bin"
  daemon_script = "/usr/lib/hbase/bin/hbase-daemon.sh"
  region_mover = "/usr/lib/hbase/bin/region_mover.rb"
  region_drainer = "/usr/lib/hbase/bin/draining_servers.rb"
  hbase_cmd = "/usr/lib/hbase/bin/hbase"

hadoop_conf_dir = "/etc/hadoop/conf"
#hbase_conf_dir = "/etc/ams-hbase/conf"
hbase_conf_dir = "/etc/ams-hbase/conf"
hbase_excluded_hosts = config['commandParams']['excluded_hosts']
hbase_drain_only = config['commandParams']['mark_draining_only']
hbase_included_hosts = config['commandParams']['included_hosts']

hbase_user = status_params.hbase_user
smokeuser = config['configurations']['cluster-env']['smokeuser']
_authentication = config['configurations']['core-site']['hadoop.security.authentication']
security_enabled = config['configurations']['cluster-env']['security_enabled']

# this is "hadoop-metrics.properties" for 1.x stacks
metric_prop_file_name = "hadoop-metrics2-hbase.properties"

# not supporting 32 bit jdk.
java64_home = config['hostLevelParams']['java_home']

hbase_log_dir = config['configurations']['ams-hbase-env']['hbase_log_dir']
master_heapsize = config['configurations']['ams-hbase-env']['hbase_master_heapsize']

regionserver_heapsize = config['configurations']['ams-hbase-env']['hbase_regionserver_heapsize']
regionserver_xmn_max = config['configurations']['ams-hbase-env']['hbase_regionserver_xmn_max']
regionserver_xmn_percent = config['configurations']['ams-hbase-env']['hbase_regionserver_xmn_ratio']
regionserver_xmn_size = calc_xmn_from_xms(regionserver_heapsize, regionserver_xmn_percent, regionserver_xmn_max)
# For embedded mode
hbase_heapsize = master_heapsize

ams_checkpoint_dir = config['configurations']['ams-site']['timeline.metrics.aggregator.checkpoint.dir']
hbase_pid_dir = status_params.hbase_pid_dir
hbase_tmp_dir = config['configurations']['ams-hbase-site']['hbase.tmp.dir']
# TODO UPGRADE default, update site during upgrade
_local_dir_conf = default('/configurations/ams-hbase-site/hbase.local.dir', "${hbase.tmp.dir}/local")
local_dir = substitute_vars(_local_dir_conf, config['configurations']['ams-hbase-site'])

client_jaas_config_file = format("{hbase_conf_dir}/hbase_client_jaas.conf")
master_jaas_config_file = format("{hbase_conf_dir}/hbase_master_jaas.conf")
regionserver_jaas_config_file = format("{hbase_conf_dir}/hbase_regionserver_jaas.conf")

# ganglia_server_hosts = default('/clusterHostInfo/ganglia_server_host', []) # is not passed when ganglia is not present
# ganglia_server_host = '' if len(ganglia_server_hosts) == 0 else ganglia_server_hosts[0]

# if hbase is selected the hbase_rs_hosts, should not be empty, but still default just in case
# if 'slave_hosts' in config['clusterHostInfo']:
#   rs_hosts = default('/clusterHostInfo/hbase_rs_hosts', '/clusterHostInfo/slave_hosts') #if hbase_rs_hosts not given it is assumed that region servers on same nodes as slaves
# else:
#   rs_hosts = default('/clusterHostInfo/hbase_rs_hosts', '/clusterHostInfo/all_hosts')

rs_hosts = ["localhost"]

smoke_test_user = config['configurations']['cluster-env']['smokeuser']
smokeuser_permissions = "RWXCA"
service_check_data = functions.get_unique_id_and_date()
user_group = config['configurations']['cluster-env']["user_group"]

if security_enabled:
  _hostname_lowercase = config['hostname'].lower()
  master_jaas_princ = config['configurations']['ams-hbase-site']['hbase.master.kerberos.principal'].replace('_HOST',_hostname_lowercase)
  regionserver_jaas_princ = config['configurations']['ams-hbase-site']['hbase.regionserver.kerberos.principal'].replace('_HOST',_hostname_lowercase)

master_keytab_path = config['configurations']['ams-hbase-site']['hbase.master.keytab.file']
regionserver_keytab_path = config['configurations']['ams-hbase-site']['hbase.regionserver.keytab.file']
smoke_user_keytab = config['configurations']['cluster-env']['smokeuser_keytab']
hbase_user_keytab = config['configurations']['ams-hbase-env']['hbase_user_keytab']
kinit_path_local = functions.get_kinit_path(["/usr/bin", "/usr/kerberos/bin", "/usr/sbin"])

# if security_enabled:
#   kinit_cmd = format("{kinit_path_local} -kt {hbase_user_keytab} {hbase_user};")
# else:
#   kinit_cmd = ""

#log4j.properties
if (('ams-hbase-log4j' in config['configurations']) and ('content' in config['configurations']['ams-hbase-log4j'])):
  hbase_log4j_props = config['configurations']['ams-hbase-log4j']['content']
else:
  hbase_log4j_props = None

if (('ams-log4j' in config['configurations']) and ('content' in config['configurations']['ams-log4j'])):
  log4j_props = config['configurations']['ams-log4j']['content']
else:
  log4j_props = None

hbase_env_sh_template = config['configurations']['ams-hbase-env']['content']
ams_env_sh_template = config['configurations']['ams-env']['content']

hbase_hdfs_root_dir = config['configurations']['ams-hbase-site']['hbase.rootdir']
hbase_staging_dir = "/apps/hbase/staging"
#for create_hdfs_directory
hostname = config["hostname"]
hdfs_user_keytab = config['configurations']['hadoop-env']['hdfs_user_keytab']
hdfs_user = config['configurations']['hadoop-env']['hdfs_user']
hdfs_principal_name = config['configurations']['hadoop-env']['hdfs_principal_name']
kinit_path_local = functions.get_kinit_path(["/usr/bin", "/usr/kerberos/bin", "/usr/sbin"])
import functools
#create partial functions with common arguments for every HdfsDirectory call
#to create hdfs directory we need to call params.HdfsDirectory in code
# HdfsDirectory = functools.partial(
#   HdfsDirectory,
#   conf_dir=hadoop_conf_dir,
#   hdfs_user=hdfs_user,
#   security_enabled = security_enabled,
#   keytab = hdfs_user_keytab,
#   kinit_path_local = kinit_path_local,
#   bin_dir = hadoop_bin_dir
# )



