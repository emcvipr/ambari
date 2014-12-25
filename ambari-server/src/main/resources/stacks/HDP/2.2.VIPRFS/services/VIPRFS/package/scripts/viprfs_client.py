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
import sys
import os
from resource_management import *

class ViPRFSClient(Script):

  def install(self, env):
    print 'Installing VIPRFS Client...';
    packages = ['viprfs-client']
    Package(packages)
    self.configure(env)

  def configure(self, env):
    print 'Configuring VIPRFS Client...';
    import params
    env.set_params(params)

  def status(self, env):
    print 'Querying VIPRFS Client Status...';
    raise ClientComponentHasNoStatus()

if __name__ == "__main__":
  ViPRFSClient().execute()
