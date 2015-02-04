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

from resource_management.core.logger import Logger
from resource_management.core.base import Fail
from resource_management import Script
from resource_management import Template

from ambari_commons import OSConst
from ambari_commons.os_family_impl import OsFamilyFuncImpl, OsFamilyImpl

import httplib
import urllib
import json
import os
import random
import time
import socket


class AMSServiceCheck(Script):
  AMS_METRICS_POST_URL = "/ws/v1/timeline/metrics/"
  AMS_METRICS_GET_URL = "/ws/v1/timeline/metrics?%s"
  AMS_CONNECT_TRIES = 3
  AMS_CONNECT_TIMEOUT = 10

  @OsFamilyFuncImpl(os_family=OSConst.WINSRV_FAMILY)
  def service_check(self, env):
    from resource_management.libraries.functions.windows_service_utils import check_windows_service_exists
    from service_mapping import collector_win_service_name, monitor_win_service_name
    import params

    env.set_params(params)

    #Just check that the services were correctly installed
    #Check the monitor on all hosts
    Logger.info("AMS Monitor service check was started.")
    if not check_windows_service_exists(monitor_win_service_name):
      raise Fail("AMS Monitor service was not properly installed. Check the logs and retry the installation.")
    #Check the collector only where installed
    if params.ams_collector_home_dir and os.path.isdir(params.ams_collector_home_dir):
      Logger.info("AMS Collector service check was started.")
      if not check_windows_service_exists(collector_win_service_name):
        raise Fail("AMS Collector service was not properly installed. Check the logs and retry the installation.")

  @OsFamilyFuncImpl(os_family=OsFamilyImpl.DEFAULT)
  def service_check(self, env):
    import params

    Logger.info("AMS service check was started.")
    env.set_params(params)

    random_value1 = random.random()
    current_time = time.time()
    metric_json = Template('smoketest_metrics.json.j2', hostname=params.hostname, random1=random_value1,
                           current_time=current_time).get_content()
    Logger.info("Generated metrics:\n%s" % metric_json)

    headers = {"Content-type": "application/json"}

    for i in xrange(0, self.AMS_CONNECT_TRIES):
      try:
        Logger.info("Connecting (POST) to %s:%s%s" % (params.ams_collector_host_single,
                                                      params.metric_collector_port,
                                                      self.AMS_METRICS_POST_URL))
        conn = httplib.HTTPConnection(params.ams_collector_host_single,
                                        int(params.metric_collector_port))
        conn.request("POST", self.AMS_METRICS_POST_URL, metric_json, headers)
        break
      except (httplib.HTTPException, socket.error) as ex:
        time.sleep(self.AMS_CONNECT_TIMEOUT)
        Logger.info("Connection failed. Next retry in %s seconds."
                    % (self.AMS_CONNECT_TIMEOUT))

    if i == self.AMS_CONNECT_TRIES:
      raise Fail("AMS metrics were not saved. Service check has failed. "
           "\nConnection failed.")

    response = conn.getresponse()
    Logger.info("Http response: %s %s" % (response.status, response.reason))

    data = response.read()
    Logger.info("Http data: %s" % data)
    conn.close()

    if response.status == 200:
      Logger.info("AMS metrics were saved.")
    else:
      Logger.info("AMS metrics were not saved. Service check has failed.")
      raise Fail("AMS metrics were not saved. Service check has failed. POST request status: %s %s \n%s" %
                 (response.status, response.reason, data))

    get_metrics_parameters = {
      "metricNames": "AMS.SmokeTest.FakeMetric",
      "appId": "amssmoketestfake",
      "hostname": params.hostname,
      "startTime": 1419860000000,
      "precision": "seconds",
      "grouped": "false",
    }
    encoded_get_metrics_parameters = urllib.urlencode(get_metrics_parameters)

    Logger.info("Connecting (GET) to %s:%s%s" % (params.ams_collector_host_single,
                                                 params.metric_collector_port,
                                              self.AMS_METRICS_GET_URL % encoded_get_metrics_parameters))

    conn = httplib.HTTPConnection(params.ams_collector_host_single,
                                  int(params.metric_collector_port))
    conn.request("GET", self.AMS_METRICS_GET_URL % encoded_get_metrics_parameters)
    response = conn.getresponse()
    Logger.info("Http response: %s %s" % (response.status, response.reason))

    data = response.read()
    Logger.info("Http data: %s" % data)
    conn.close()

    if response.status == 200:
      Logger.info("AMS metrics were retrieved.")
    else:
      Logger.info("AMS metrics were not retrieved. Service check has failed.")
      raise Fail("AMS metrics were not retrieved. Service check has failed. GET request status: %s %s \n%s" %
                 (response.status, response.reason, data))
    data_json = json.loads(data)

    def floats_eq(f1, f2, delta):
      return abs(f1-f2) < delta

    for metrics_data in data_json["metrics"]:
      if (floats_eq(metrics_data["metrics"]["1419860001000"], random_value1, 0.0000001)
          and floats_eq(metrics_data["metrics"]["1419860002000"], current_time, 1)):
        Logger.info("Values %s and %s were found in response." % (random_value1, current_time))
        break
      pass
    else:
      Logger.info("Values %s and %s were not found in response." % (random_value1, current_time))
      raise Fail("Values %s and %s were not found in response." % (random_value1, current_time))

    Logger.info("AMS service check is finished.")

if __name__ == "__main__":
  AMSServiceCheck().execute()

