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

Ambari Agent

"""

__all__ = ["find_path"]
import os


def find_path(search_directories, filename):
  """
  @param search_directories: comma separated list of (absolute paths to) directories to search (in order of preference)
  @param filename: the name of the file for which to search
  """
  path = ""

  for current_directory in search_directories:
    if current_directory:  # current_directory neither None nor empty
      current_path = os.path.join(current_directory, filename)
      if os.path.isfile(current_path):
        path = current_path
        break

  return path
