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

import os
import shutil
import string

from ambari_commons import OSCheck

if OSCheck.is_windows_family():
  from ambari_commons.os_windows import os_change_owner, os_getpass, os_is_root, os_run_os_command, \
    os_set_open_files_limit, os_set_file_permissions
else:
  # MacOS not supported
  from ambari_commons.os_linux import os_change_owner, os_getpass, os_is_root, os_run_os_command, \
    os_set_open_files_limit, os_set_file_permissions
  pass

from ambari_commons.exceptions import FatalException
from ambari_commons.logging_utils import print_info_msg, print_warning_msg


def is_valid_filepath(filepath):
  if not filepath or not os.path.exists(filepath) or os.path.isdir(filepath):
    print 'Invalid path, please provide the absolute file path.'
    return False
  else:
    return True

def quote_path(filepath):
  if(filepath.find(' ') != -1):
    filepath_ret = '"' + filepath + '"'
  else:
    filepath_ret = filepath
  return filepath_ret

def _search_file(filename, search_path, pathsep):
  for path in string.split(search_path, pathsep):
    candidate = os.path.join(path, filename)
    if os.path.exists(candidate):
      return os.path.abspath(candidate)
  return None

def search_file(filename, search_path, pathsep=os.pathsep):
  """ Given a search path, find file with requested name """
  return _search_file(filename, search_path, pathsep)

def copy_file(src, dest_file):
  try:
    shutil.copyfile(src, dest_file)
  except Exception, e:
    err = "Can not copy file {0} to {1} due to: {2} . Please check file " \
              "permissions and free disk space.".format(src, dest_file, e.message)
    raise FatalException(1, err)

def copy_files(files, dest_dir):
  if os.path.isdir(dest_dir):
    for filepath in files:
      shutil.copy(filepath, dest_dir)
    return 0
  else:
    return -1

def remove_file(filePath):
  if os.path.exists(filePath):
    try:
      os.remove(filePath)
    except Exception, e:
      print_warning_msg('Unable to remove file: ' + str(e))
      return 1
  pass
  return 0

def set_file_permissions(file, mod, user, recursive):
  if os.path.exists(file):
    os_set_file_permissions(file, mod, recursive, user)
  else:
    print_info_msg("File %s does not exist" % file)

def run_os_command(cmd, env=None):
  return os_run_os_command(cmd, env, False)

def run_in_shell(cmd, env=None):
  return os_run_os_command(cmd, env, True)

def is_root():
  return os_is_root()

# Proxy to the os implementation
def change_owner(filePath, user):
  os_change_owner(filePath, user)

# Proxy to the os implementation
def set_open_files_limit(maxOpenFiles):
  os_set_open_files_limit(maxOpenFiles)

def get_password(prompt):
  return os_getpass(prompt)

def find_in_path(file):
  full_path = _search_file(file, os.environ["PATH"], os.pathsep)
  if full_path is None:
    raise Exception("File {0} not found in PATH".format(file))
  return full_path