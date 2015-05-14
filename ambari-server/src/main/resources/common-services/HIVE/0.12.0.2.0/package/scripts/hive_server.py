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
import hive_server_upgrade

from resource_management import *
from hive import hive
from hive_service import hive_service
from resource_management.libraries.functions import conf_select
from resource_management.libraries.functions import hdp_select
from resource_management.libraries.functions.security_commons import build_expectations, \
  cached_kinit_executor, get_params_from_filesystem, validate_security_config_properties, \
  FILE_TYPE_XML
from setup_ranger_hive import setup_ranger_hive
from ambari_commons.os_family_impl import OsFamilyImpl
from ambari_commons import OSConst


class HiveServer(Script):
  def install(self, env):
    import params
    self.install_packages(env, exclude_packages=params.hive_exclude_packages)

  def configure(self, env):
    import params
    env.set_params(params)
    hive(name='hiveserver2')


@OsFamilyImpl(os_family=OSConst.WINSRV_FAMILY)
class HiveServerWindows(HiveServer):
  def start(self, env):
    import params
    env.set_params(params)
    self.configure(env) # FOR SECURITY
    hive_service('hiveserver2', action='start')

  def stop(self, env):
    import params
    env.set_params(params)
    hive_service('hiveserver2', action='stop')

  def status(self, env):
    import status_params
    check_windows_service_status(status_params.hive_server_win_service_name)


@OsFamilyImpl(os_family=OsFamilyImpl.DEFAULT)
class HiveServerDefault(HiveServer):
  def get_stack_to_component(self):
    return {"HDP": "hive-server2"}

  def start(self, env, rolling_restart=False):
    import params
    env.set_params(params)
    self.configure(env) # FOR SECURITY

    setup_ranger_hive()    
    hive_service( 'hiveserver2', action = 'start',
      rolling_restart=rolling_restart )

  def stop(self, env, rolling_restart=False):
    import params
    env.set_params(params)

    if rolling_restart:
      hive_server_upgrade.pre_upgrade_deregister()
    else:
      hive_service( 'hiveserver2', action = 'stop' )

  def status(self, env):
    import status_params
    env.set_params(status_params)
    pid_file = format("{hive_pid_dir}/{hive_pid}")

    # Recursively check all existing gmetad pid files
    check_process_status(pid_file)

  def pre_rolling_restart(self, env):
    Logger.info("Executing HiveServer2 Rolling Upgrade pre-restart")
    import params
    env.set_params(params)

    if params.version and compare_versions(format_hdp_stack_version(params.version), '2.2.0.0') >= 0:
      conf_select.select(params.stack_name, "hive", params.version)
      hdp_select.select("hive-server2", params.version)
      params.HdfsResource(InlineTemplate(params.mapreduce_tar_destination).get_content(),
                          type="file",
                          action="create_on_execute",
                          source=params.mapreduce_tar_source,
                          group=params.user_group,
                          mode=params.tarballs_mode
      )
      params.HdfsResource(None, action="execute")

  def security_status(self, env):
    import status_params
    env.set_params(status_params)
    if status_params.security_enabled:
      props_value_check = {"hive.server2.authentication": "KERBEROS",
                           "hive.metastore.sasl.enabled": "true",
                           "hive.security.authorization.enabled": "true"}
      props_empty_check = ["hive.server2.authentication.kerberos.keytab",
                           "hive.server2.authentication.kerberos.principal",
                           "hive.server2.authentication.spnego.principal",
                           "hive.server2.authentication.spnego.keytab"]

      props_read_check = ["hive.server2.authentication.kerberos.keytab",
                          "hive.server2.authentication.spnego.keytab"]
      hive_site_props = build_expectations('hive-site', props_value_check, props_empty_check,
                                            props_read_check)

      hive_expectations ={}
      hive_expectations.update(hive_site_props)

      security_params = get_params_from_filesystem(status_params.hive_conf_dir,
                                                   {'hive-site.xml': FILE_TYPE_XML})
      result_issues = validate_security_config_properties(security_params, hive_expectations)
      if not result_issues: # If all validations passed successfully
        try:
          # Double check the dict before calling execute
          if 'hive-site' not in security_params \
            or 'hive.server2.authentication.kerberos.keytab' not in security_params['hive-site'] \
            or 'hive.server2.authentication.kerberos.principal' not in security_params['hive-site']  \
            or 'hive.server2.authentication.spnego.keytab' not in security_params['hive-site'] \
            or 'hive.server2.authentication.spnego.principal' not in security_params['hive-site']:
            self.put_structured_out({"securityState": "UNSECURED"})
            self.put_structured_out({"securityIssuesFound": "Keytab file or principal are not set property."})
            return

          cached_kinit_executor(status_params.kinit_path_local,
                                status_params.hive_user,
                                security_params['hive-site']['hive.server2.authentication.kerberos.keytab'],
                                security_params['hive-site']['hive.server2.authentication.kerberos.principal'],
                                status_params.hostname,
                                status_params.tmp_dir)
          cached_kinit_executor(status_params.kinit_path_local,
                                status_params.hive_user,
                                security_params['hive-site']['hive.server2.authentication.spnego.keytab'],
                                security_params['hive-site']['hive.server2.authentication.spnego.principal'],
                                status_params.hostname,
                                status_params.tmp_dir)
          self.put_structured_out({"securityState": "SECURED_KERBEROS"})
        except Exception as e:
          self.put_structured_out({"securityState": "ERROR"})
          self.put_structured_out({"securityStateErrorInfo": str(e)})
      else:
        issues = []
        for cf in result_issues:
          issues.append("Configuration file %s did not pass the validation. Reason: %s" % (cf, result_issues[cf]))
        self.put_structured_out({"securityIssuesFound": ". ".join(issues)})
        self.put_structured_out({"securityState": "UNSECURED"})
    else:
      self.put_structured_out({"securityState": "UNSECURED"})


if __name__ == "__main__":
  HiveServer().execute()
