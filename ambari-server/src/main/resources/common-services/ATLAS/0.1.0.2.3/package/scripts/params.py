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
import os
import sys
from resource_management import format_hdp_stack_version, Script
from resource_management.libraries.functions import format

import status_params

# server configurations
config = Script.get_config()

# security enabled
security_enabled = status_params.security_enabled

# hdp version
stack_version_unformatted = str(config['hostLevelParams']['stack_version'])
hdp_stack_version = format_hdp_stack_version(stack_version_unformatted)

metadata_home = os.environ['METADATA_HOME_DIR'] if 'METADATA_HOME_DIR' in os.environ else '/usr/hdp/current/atlas-server'
metadata_bin = format("{metadata_home}/bin")

python_binary = os.environ['PYTHON_EXE'] if 'PYTHON_EXE' in os.environ else sys.executable
metadata_start_script = format("{metadata_bin}/metadata_start.py")
metadata_stop_script = format("{metadata_bin}/metadata_stop.py")

# metadata local directory structure
log_dir = config['configurations']['metadata-env']['metadata_log_dir']
conf_dir = status_params.conf_dir # "/etc/metadata/conf"

# service locations
hadoop_conf_dir = os.path.join(os.environ["HADOOP_HOME"], "conf") if 'HADOOP_HOME' in os.environ else '/etc/hadoop/conf'

# user and status
metadata_user = status_params.metadata_user
user_group = config['configurations']['cluster-env']['user_group']
pid_dir = status_params.pid_dir
pid_file = format("{pid_dir}/metadata.pid")

# metadata env
java64_home = config['hostLevelParams']['java_home']
env_sh_template = config['configurations']['metadata-env']['content']

# credential provider
credential_provider = format( "jceks://file@{conf_dir}/atlas-site.jceks")

# command line args
metadata_port = config['configurations']['metadata-env']['metadata_port']
metadata_host = config['hostname']

# application properties
application_properties = config['configurations']['application-properties']

for key, value in application_properties.iteritems():
    globals()[key] = value

metadata_env_content = config['configurations']['metadata-env']['content']
application_properties_content = config['configurations']['application-properties']['content']

metadata_opts = config['configurations']['metadata-env']['metadata_opts']
metadata_classpath = config['configurations']['metadata-env']['metadata_classpath']
data_dir = config['configurations']['metadata-env']['metadata_data_dir']
expanded_war_dir = os.environ['METADATA_EXPANDED_WEBAPP_DIR'] if 'METADATA_EXPANDED_WEBAPP_DIR' in os.environ else '/var/lib/atlas/server/webapp'