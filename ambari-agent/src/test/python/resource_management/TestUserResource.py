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
from mock.mock import patch, MagicMock

from resource_management.core import Environment, Fail
from resource_management.core.system import System
from resource_management.core.resources import User
import pwd
import subprocess
import os

@patch.object(System, "os_family", new = 'redhat')
@patch.object(os, "environ", new = {'PATH':'/bin'})
class TestUserResource(TestCase):

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_action_create_nonexistent(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = None
    with Environment('/') as env:
      user = User("mapred", action = "create", shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E useradd -m -s /bin/bash mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_action_create_existent(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -s /bin/bash mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_action_delete(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "remove", shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', 'userdel mapred'], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_comment(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", comment = "testComment", 
          shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -c testComment -s /bin/bash mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_home(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", home = "/test/home", 
          shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -s /bin/bash -d /test/home mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_password(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", password = "secure", 
          shell = "/bin/bash")    

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -s /bin/bash -p secure mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_shell(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", shell = "/bin/sh")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -s /bin/sh mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_uid(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", uid = "1", shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -s /bin/bash -u 1 mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_gid(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", gid = "1", shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -s /bin/bash -g 1 mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_attribute_groups(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = 1

    with Environment('/') as env:
      user = User("mapred", action = "create", groups = ['1','2','3'], 
          shell = "/bin/bash")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E usermod -G 1,2,3 -s /bin/bash mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)

  @patch.object(subprocess, "Popen")
  @patch.object(pwd, "getpwnam")
  def test_missing_shell_argument(self, getpwnam_mock, popen_mock):
    subproc_mock = MagicMock()
    subproc_mock.returncode = 0
    subproc_mock.stdout.readline = MagicMock(side_effect = ['OK'])
    popen_mock.return_value = subproc_mock
    getpwnam_mock.return_value = None
    with Environment('/') as env:
      user = User("mapred", action = "create")

    popen_mock.assert_called_with(['/bin/bash', '--login', '--noprofile', '-c', "/usr/bin/sudo  PATH=/bin -H -E useradd -m mapred"], shell=False, preexec_fn=None, stderr=-2, stdout=-1, env={'PATH': '/bin'}, cwd=None)
    self.assertEqual(popen_mock.call_count, 1)
