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

from unittest import TestCase
import unittest
import ambari_agent.hostname as hostname
from ambari_agent.AmbariConfig import AmbariConfig
import socket
import tempfile
import shutil
import os, pprint, json,stat
from mock.mock import patch, MagicMock
from ambari_commons import OSCheck
from only_for_platform import only_for_platform, get_platform, not_for_platform, PLATFORM_LINUX, PLATFORM_WINDOWS

if get_platform() != PLATFORM_WINDOWS:
  os_distro_value = ('Suse','11','Final')
else:
  os_distro_value = ('win2012serverr2','6.3','WindowsServer')

class TestHostname(TestCase):

  @patch.object(OSCheck, "os_distribution", new = MagicMock(return_value = os_distro_value))
  def test_hostname(self):
    hostname.cached_hostname = None
    hostname.cached_public_hostname = None
    config = AmbariConfig()
    self.assertEquals(hostname.hostname(config), socket.getfqdn().lower(),
                      "hostname should equal the socket-based hostname")
    pass

  def test_server_hostname(self):
    hostname.cached_server_hostname = None
    config = AmbariConfig()
    default_server_hostname = config.get('server', 'hostname')
    config.set('server', 'hostname', 'ambari-host')
    self.assertEquals('ambari-host', hostname.server_hostname(config),
                      "hostname should equal the socket-based hostname")
    config.set('server', 'hostname', default_server_hostname)
    pass

  @not_for_platform(PLATFORM_WINDOWS)
  def test_server_hostname_override(self):
    hostname.cached_server_hostname = None
    fd = tempfile.mkstemp(text=True)
    tmpname = fd[1]
    os.close(fd[0])
    os.chmod(tmpname, os.stat(tmpname).st_mode | stat.S_IXUSR)

    tmpfile = file(tmpname, "w+")
    config = AmbariConfig()
    try:
      tmpfile.write("#!/bin/sh\n\necho 'test.example.com'")
      tmpfile.close()

      config.set('server', 'hostname_script', tmpname)

      self.assertEquals(hostname.server_hostname(config), 'test.example.com', "expected hostname 'test.example.com'")
    finally:
      os.remove(tmpname)
      config.remove_option('server', 'hostname_script')
    pass

  @only_for_platform(PLATFORM_LINUX)
  def test_hostname_override(self):
    hostname.cached_hostname = None
    hostname.cached_public_hostname = None
    fd = tempfile.mkstemp(text=True)
    tmpname = fd[1]
    os.close(fd[0])
    os.chmod(tmpname, os.stat(tmpname).st_mode | stat.S_IXUSR)

    tmpfile = file(tmpname, "w+")
    config = AmbariConfig()
    try:
      tmpfile.write("#!/bin/sh\n\necho 'test.example.com'")
      tmpfile.close()

      config.set('agent', 'hostname_script', tmpname)

      self.assertEquals(hostname.hostname(config), 'test.example.com', "expected hostname 'test.example.com'")
    finally:
      os.remove(tmpname)
      config.remove_option('agent', 'hostname_script')
    pass

  @only_for_platform(PLATFORM_LINUX)
  def test_public_hostname_override(self):
    hostname.cached_hostname = None
    hostname.cached_public_hostname = None
    fd = tempfile.mkstemp(text=True)
    tmpname = fd[1]
    os.close(fd[0])
    os.chmod(tmpname, os.stat(tmpname).st_mode | stat.S_IXUSR)

    tmpfile = file(tmpname, "w+")

    config = AmbariConfig()
    try:
      tmpfile.write("#!/bin/sh\n\necho 'test.example.com'")
      tmpfile.close()

      config.set('agent', 'public_hostname_script', tmpname)

      self.assertEquals(hostname.public_hostname(config), 'test.example.com',
                        "expected hostname 'test.example.com'")
    finally:
      os.remove(tmpname)
      config.remove_option('agent', 'public_hostname_script')
    pass

  @patch.object(OSCheck, "os_distribution", new = MagicMock(return_value = os_distro_value))
  @patch.object(socket, "getfqdn")
  def test_caching(self, getfqdn_mock):
    hostname.cached_hostname = None
    hostname.cached_public_hostname = None
    config = AmbariConfig()
    getfqdn_mock.side_effect = ["test.example.com", "test2.example.com'"]
    self.assertEquals(hostname.hostname(config), "test.example.com")
    self.assertEquals(hostname.hostname(config), "test.example.com")
    self.assertEqual(getfqdn_mock.call_count, 1)
    pass

if __name__ == "__main__":
  unittest.main(verbosity=2)


