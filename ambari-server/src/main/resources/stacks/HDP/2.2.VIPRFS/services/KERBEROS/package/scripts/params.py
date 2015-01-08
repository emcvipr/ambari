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

from resource_management import *
from utils import get_property_value, get_unstructured_data

os_family = System.get_instance().os_family

krb5_conf_dir = '/etc'
krb5_conf_file = 'krb5.conf'
krb5_conf_path = krb5_conf_dir + '/' + krb5_conf_file

if os_family == 'suse':
  kdc_conf_dir = '/var/lib/kerberos/krb5kdc'
elif os_family == 'ubuntu':
  kdc_conf_dir = '/etc/krb5kdc'
else:
  kdc_conf_dir = '/var/kerberos/krb5kdc'
kdc_conf_file = 'kdc.conf'
kdc_conf_path = kdc_conf_dir + '/' + kdc_conf_file

kadm5_acl_dir = kdc_conf_dir  # Typically kadm5.acl and kdc.conf exist in the same directory
kadm5_acl_file = 'kadm5.acl'
kadm5_acl_path = kadm5_acl_dir + '/' + kadm5_acl_file

config = Script.get_config()

command_params = None
configurations = None
keytab_details = None
default_group = None
cluster_env = None
kdc_server_host = None
cluster_host_info = None

kdb5_util_path = 'kdb5_util'

kdamin_pid_path = '/var/run/kadmind.pid'
krb5kdc_pid_path = '/var/run/krb5kdc.pid'

smoke_test_principal = None
smoke_test_keytab_file = None

# If a test keytab file is available, simply use it


if config is not None:
  command_params = get_property_value(config, 'commandParams')
  if command_params is not None:
    keytab_details = get_unstructured_data(command_params, 'keytab')

  configurations = get_property_value(config, 'configurations')
  if configurations is not None:
    cluster_env = get_property_value(configurations, 'cluster-env')

    if cluster_env is not None:
      smoke_test_principal = get_property_value(cluster_env, 'smokeuser')
      smoke_test_keytab_file = get_property_value(cluster_env, 'smokeuser_keytab')

      default_group = get_property_value(cluster_env, 'user_group')

      if default_group is None:
        default_group = get_property_value(cluster_env, 'user-group')

  cluster_host_info = get_property_value(config, 'clusterHostInfo')
  if cluster_host_info is not None:
    kdc_server_hosts = get_property_value(cluster_host_info, 'kdc_server_hosts')

    if (kdc_server_hosts is not None) and (len(kdc_server_hosts) > 0):
      kdc_server_host = kdc_server_hosts[0]

  # ################################################################################################
  # Get krb5.conf template data
  # ################################################################################################
  logging_default = 'FILE:/var/log/krb5libs.log'
  logging_kdc = 'FILE:/var/log/krb5kdc.log'
  logging_admin_server = 'FILE:/var/log/kadmind.log'
  libdefaults_dns_lookup_realm = 'false'
  libdefaults_dns_lookup_kdc = 'false'
  libdefaults_ticket_lifetime = '24h'
  libdefaults_renew_lifetime = '7d'
  libdefaults_forwardable = 'true'
  libdefaults_default_tgs_enctypes = 'aes256-cts-hmac-sha1-96 aes128-cts-hmac-sha1-96 des3-cbc-sha1 ' \
                                     'arcfour-hmac-md5 camellia256-cts-cmac camellia128-cts-cmac ' \
                                     'des-cbc-crc des-cbc-md5 des-cbc-md4'
  libdefaults_default_tkt_enctypes = 'aes256-cts-hmac-sha1-96 aes128-cts-hmac-sha1-96 des3-cbc-sha1 ' \
                                     'arcfour-hmac-md5 camellia256-cts-cmac camellia128-cts-cmac ' \
                                     'des-cbc-crc des-cbc-md5 des-cbc-md4'
  realm = 'EXAMPLE.COM'
  domains = ''
  kdc_host = 'localhost'
  admin_server_host = None
  admin_principal = None
  admin_password = None
  admin_keytab = None
  test_principal = None
  test_password = None
  test_keytab = None
  test_keytab_file = None

  krb5_conf_template = None

  krb5_conf_data = get_property_value(configurations, 'krb5-conf')

  if krb5_conf_data is not None:
    logging_default = get_property_value(krb5_conf_data, 'logging_default', logging_default)
    logging_kdc = get_property_value(krb5_conf_data, 'logging_kdc', logging_kdc)
    logging_admin_server = get_property_value(krb5_conf_data, 'logging_admin_server',
                                              logging_admin_server)
    libdefaults_dns_lookup_realm = get_property_value(krb5_conf_data,
                                                      'libdefaults_dns_lookup_realm',
                                                      libdefaults_dns_lookup_realm)
    libdefaults_dns_lookup_kdc = get_property_value(krb5_conf_data, 'libdefaults_dns_lookup_kdc',
                                                    libdefaults_dns_lookup_kdc)
    libdefaults_ticket_lifetime = get_property_value(krb5_conf_data, 'libdefaults_ticket_lifetime',
                                                     libdefaults_ticket_lifetime)
    libdefaults_renew_lifetime = get_property_value(krb5_conf_data, 'libdefaults_renew_lifetime',
                                                    libdefaults_renew_lifetime)
    libdefaults_forwardable = get_property_value(krb5_conf_data, 'libdefaults_forwardable',
                                                 libdefaults_forwardable)
    libdefaults_default_tgs_enctypes = get_property_value(krb5_conf_data,
                                                          'libdefaults_default_tgs_enctypes',
                                                          libdefaults_default_tgs_enctypes)
    libdefaults_default_tkt_enctypes = get_property_value(krb5_conf_data,
                                                          'libdefaults_default_tkt_enctypes',
                                                          libdefaults_default_tkt_enctypes)
    realm = get_property_value(krb5_conf_data, 'realm', realm)
    domains = get_property_value(krb5_conf_data, 'domains', domains)
    kdc_host = get_property_value(krb5_conf_data, 'kdc_host', kdc_host)
    admin_server_host = get_property_value(krb5_conf_data, 'admin_server_host', admin_server_host)

    admin_principal = get_property_value(krb5_conf_data, 'admin_principal', admin_principal)
    admin_password = get_property_value(krb5_conf_data, 'admin_password', admin_password)
    admin_keytab = get_property_value(krb5_conf_data, 'admin_keytab', admin_keytab)

    # If the admin keytab is just white space, set it to None
    if admin_keytab is not None:
      admin_keytab = admin_keytab.strip()

      if len(admin_keytab) == 0:
        admin_keytab = None

    test_principal = get_property_value(krb5_conf_data, 'test_principal', test_principal)
    test_password = get_property_value(krb5_conf_data, 'test_password', test_password)
    test_keytab = get_property_value(krb5_conf_data, 'test_keytab', test_keytab)
    test_keytab_file = get_property_value(krb5_conf_data, 'test_keytab_file', test_keytab_file)

    # If the test keytab is just white space, set it to None
    if test_keytab is not None:
      test_keytab = test_keytab.strip()

      if len(test_keytab) == 0:
        test_keytab = None

    krb5_conf_template = get_property_value(krb5_conf_data, 'content', krb5_conf_template)
    krb5_conf_dir = get_property_value(krb5_conf_data, 'conf_dir', krb5_conf_dir)
    krb5_conf_file = get_property_value(krb5_conf_data, 'conf_file', krb5_conf_file)
    krb5_conf_path = krb5_conf_dir + '/' + krb5_conf_file

  # ################################################################################################
  # Get kdc.conf template data
  # ################################################################################################
  kdcdefaults_kdc_ports = "88"
  kdcdefaults_kdc_tcp_ports = "88"

  kdc_conf_template = None

  kdc_conf_data = get_property_value(configurations, 'kdc-conf')

  if kdc_conf_data is not None:
    kdcdefaults_kdc_ports = get_property_value(kdc_conf_data, 'kdcdefaults_kdc_ports',
                                               kdcdefaults_kdc_ports)
    kdcdefaults_kdc_tcp_ports = get_property_value(kdc_conf_data, 'kdcdefaults_kdc_tcp_ports',
                                                   kdcdefaults_kdc_tcp_ports)

    kdc_conf_template = get_property_value(kdc_conf_data, 'content', kdc_conf_template)
    kdc_conf_dir = get_property_value(kdc_conf_data, 'conf_dir', kdc_conf_dir)
    kdc_conf_file = get_property_value(kdc_conf_data, 'conf_file', kdc_conf_file)
    kdc_conf_path = kdc_conf_dir + '/' + kdc_conf_file

  # ################################################################################################
  # Get kadm5.acl template data
  # ################################################################################################
  kdcdefaults_kdc_ports = '88'
  kdcdefaults_kdc_tcp_ports = '88'

  kadm5_acl_template = None

  kadm5_acl_data = get_property_value(configurations, 'kadm5-acl')

  if kadm5_acl_data is not None:
    kadm5_acl_template = get_property_value(kadm5_acl_data, 'content', kadm5_acl_template)
    kadm5_acl_dir = get_property_value(kadm5_acl_data, 'conf_dir', kadm5_acl_dir)
    kadm5_acl_file = get_property_value(kadm5_acl_data, 'conf_file', kadm5_acl_file)
    kadm5_acl_path = kadm5_acl_dir + '/' + kadm5_acl_file
