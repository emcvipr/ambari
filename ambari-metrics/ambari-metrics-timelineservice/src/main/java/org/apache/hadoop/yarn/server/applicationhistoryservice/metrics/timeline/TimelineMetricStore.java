/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.hadoop.yarn.server.applicationhistoryservice.metrics.timeline;

import org.apache.hadoop.metrics2.sink.timeline.Precision;
import org.apache.hadoop.metrics2.sink.timeline.TimelineMetric;
import org.apache.hadoop.metrics2.sink.timeline.TimelineMetricMetadata;
import org.apache.hadoop.metrics2.sink.timeline.TimelineMetrics;
import org.apache.hadoop.yarn.api.records.timeline.TimelinePutResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface TimelineMetricStore {
  /**
   * This method retrieves metrics stored byu the Timeline store.
   *
   * @param metricNames Names of the metric, e.g.: cpu_user
   * @param hostnames Names of the host where the metric originated from
   * @param applicationId Id of the application to which this metric belongs
   * @param instanceId Application instance id.
   * @param startTime Start timestamp
   * @param endTime End timestamp
   * @param precision Precision [ seconds, minutes, hours ]
   * @param limit Override default result limit
   * @param groupedByHosts Group {@link TimelineMetric} by metric name, hostname,
   *                app id and instance id
   *
   * @return {@link TimelineMetric}
   * @throws java.sql.SQLException
   */
  TimelineMetrics getTimelineMetrics(List<String> metricNames, List<String> hostnames,
      String applicationId, String instanceId, Long startTime,
      Long endTime, Precision precision, Integer limit, boolean groupedByHosts)
    throws SQLException, IOException;


  /**
   * Return all records for a single metric satisfying the filter criteria.
   * @return {@link TimelineMetric}
   */
  TimelineMetric getTimelineMetric(String metricName, List<String> hostname,
      String applicationId, String instanceId, Long startTime,
      Long endTime, Precision precision, Integer limit)
      throws SQLException, IOException;


  /**
   * Stores metric information to the timeline store. Any errors occurring for
   * individual put request objects will be reported in the response.
   *
   * @param metrics An {@link TimelineMetrics}.
   * @return An {@link org.apache.hadoop.yarn.api.records.timeline.TimelinePutResponse}.
   * @throws SQLException, IOException
   */
  TimelinePutResponse putMetrics(TimelineMetrics metrics) throws SQLException, IOException;

  /**
   * Return all metrics metadata that have been written to the store.
   * @return { appId : [ @TimelineMetricMetadata ] }
   * @throws SQLException
   * @throws IOException
   */
  Map<String, List<TimelineMetricMetadata>> getTimelineMetricMetadata() throws SQLException, IOException;

  /**
   * Returns all hosts that have written metrics with the apps on the host
   * @return { hostname : [ appIds ] }
   * @throws SQLException
   * @throws IOException
   */
  Map<String, Set<String>> getHostAppsMetadata() throws SQLException, IOException;

  /**
   * Return a list of known live collector nodes
   * @return [ hostname ]
   */
  List<String> getLiveInstances();
}
