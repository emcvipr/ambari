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

var App = require('app');

var hdp2properties = [
  //***************************************** HDP stack **************************************
/**********************************************HDFS***************************************/
  {
    "id": "site property",
    "name": "dfs.namenode.checkpoint.dir",
    "displayName": "SecondaryNameNode Checkpoint directories",
    "defaultDirectory": "/hadoop/hdfs/namesecondary",
    "displayType": "directories",
    "isOverridable": false,
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "category": "SECONDARY_NAMENODE",
    "index": 1
  },
  {
    "id": "site property",
    "name": "dfs.namenode.checkpoint.period",
    "displayName": "HDFS Maximum Checkpoint Delay",
    "displayType": "int",
    "unit": "seconds",
    "category": "General",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 3
  },
  {
    "id": "site property",
    "name": "dfs.namenode.name.dir",
    "displayName": "NameNode directories",
    "defaultDirectory": "/hadoop/hdfs/namenode",
    "displayType": "directories",
    "isOverridable": false,
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "category": "NAMENODE",
    "index": 1
  },
  {
    "id": "site property",
    "name": "dfs.webhdfs.enabled",
    "displayName": "WebHDFS enabled",
    "displayType": "checkbox",
    "isOverridable": false,
    "category": "General",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 0
  },
  {
    "id": "site property",
    "name": "dfs.datanode.failed.volumes.tolerated",
    "displayName": "DataNode volumes failure toleration",
    "displayType": "int",
    "category": "DATANODE",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 3
  },
  {
    "id": "site property",
    "name": "dfs.datanode.data.dir.mount.file",
    "displayName": "File that stores mount point for each data dir",
    "description": "File path that contains the last known mount point for each data dir. This file is used to avoid creating a DFS data dir on the root drive (and filling it up) if a path was previously mounted on a drive.",
    "recommendedValue": "/etc/hadoop/conf/dfs_data_dir_mount.hist",
    "displayType": "directory",
    "isVisible": true,
    "category": "DATANODE",
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "index": 4
  },
  {
    "id": "site property",
    "name": "dfs.datanode.data.dir",
    "displayName": "DataNode directories",
    "defaultDirectory": "/hadoop/hdfs/data",
    "displayType": "directories",
    "category": "DATANODE",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 1
  },
  {
    "id": "site property",
    "name": "dfs.datanode.data.dir.perm",
    "displayName": "DataNode directories permission",
    "displayType": "int",
    "category": "DATANODE",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml"
  },
  {
    "id": "site property",
    "name": "nfs.file.dump.dir",
    "displayName": "NFSGateway dump directory",
    "defaultDirectory": "/tmp/.hdfs-nfs",
    "displayType": "directory",
    "category": "NFS_GATEWAY",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 1
  },
  {
    "id": "site property",
    "name": "dfs.namenode.accesstime.precision",
    "displayName": "Access time precision",
    "recommendedValue": "0",
    "displayType": "long",
    "category": "General",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 2
  },
  {
    "id": "site property",
    "name": "nfs.exports.allowed.hosts",
    "displayName": "Allowed hosts",
    "recommendedValue": "* rw",
    "displayType": "string",
    "category": "NFS_GATEWAY",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 3
  },
  {
    "id": "site property",
    "name": "dfs.replication",
    "displayName": "Block replication",
    "displayType": "int",
    "category": "General",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml"
  },
  {
    "id": "site property",
    "name": "dfs.datanode.du.reserved",
    "displayName": "Reserved space for HDFS",
    "displayType": "int",
    "unit": "bytes",
    "category": "General",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml",
    "index": 2
  },
  {
    "id": "site property",
    "name": "dfs.client.read.shortcircuit",
    "displayName": "HDFS Short-circuit read",
    "displayType": "checkbox",
    "category": "Advanced hdfs-site",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml"
  },
  {
    "id": "site property",
    "name": "apache_artifacts_download_url",
    "displayName": "apache_artifacts_download_url",
    "description": "",
    "isRequired": false,
    "isRequiredByAgent": false,
    "isVisible": false,
    "category": "Advanced hdfs-site",
    "filename": "hdfs-site.xml",
    "serviceName": "HDFS"
  },
  {
    "id": "site property",
    "name": "dfs.cluster.administrators",
    "displayName": "dfs.cluster.administrators",
    "description": "ACL for who all can view the default servlets in the HDFS",
    "isVisible": true,
    "category": "Advanced hdfs-site",
    "serviceName": "HDFS",
    "filename": "hdfs-site.xml"
  },

/**********************************************YARN***************************************/
  {
    "id": "site property",
    "name": "yarn.acl.enable",
    "displayName": "yarn.acl.enable",
    "displayType": "checkbox",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "RESOURCEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.admin.acl",
    "displayName": "yarn.admin.acl",
    "isRequired": false,
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "RESOURCEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.log-aggregation-enable",
    "displayName": "yarn.log-aggregation-enable",
    "displayType": "checkbox",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "RESOURCEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.resourcemanager.scheduler.class",
    "displayName": "yarn.resourcemanager.scheduler.class",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "CapacityScheduler"
  },
  {
    "id": "site property",
    "name": "yarn.scheduler.minimum-allocation-mb",
    "displayName": "yarn.scheduler.minimum-allocation-mb",
    "displayType": "int",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "CapacityScheduler"
  },
  {
    "id": "site property",
    "name": "yarn.scheduler.maximum-allocation-mb",
    "displayName": "yarn.scheduler.maximum-allocation-mb",
    "displayType": "int",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "CapacityScheduler"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.resource.memory-mb",
    "displayName": "yarn.nodemanager.resource.memory-mb",
    "displayType": "int",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.vmem-pmem-ratio",
    "displayName": "yarn.nodemanager.vmem-pmem-ratio",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.linux-container-executor.group",
    "displayName": "yarn.nodemanager.linux-container-executor.group",
    "serviceName": "YARN",
    "category": "NODEMANAGER",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.log-dirs",
    "displayName": "yarn.nodemanager.log-dirs",
    "defaultDirectory": "/hadoop/yarn/log",
    "displayType": "directories",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.local-dirs",
    "displayName": "yarn.nodemanager.local-dirs",
    "defaultDirectory": "/hadoop/yarn/local",
    "displayType": "directories",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.remote-app-log-dir",
    "displayName": "yarn.nodemanager.remote-app-log-dir",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.remote-app-log-dir-suffix",
    "displayName": "yarn.nodemanager.remote-app-log-dir-suffix",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.aux-services",
    "displayName": "yarn.nodemanager.aux-services",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.nodemanager.log.retain-second",
    "displayName": "yarn.nodemanager.log.retain-second",
    "serviceName": "YARN",
    "filename": "yarn-site.xml",
    "category": "NODEMANAGER"
  },
  {
    "id": "site property",
    "name": "yarn.log.server.url",
    "displayName": "yarn.log.server.url",
    "category": "Advanced yarn-site",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
/**********************************************MAPREDUCE2***************************************/
  {
    "id": "site property",
    "name": "mapreduce.map.memory.mb",
    "displayName": "Default virtual memory for a job's map-task",
    "displayType": "int",
    "unit": "MB",
    "category": "General",
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-site.xml"
  },
  {
    "id": "site property",
    "name": "mapreduce.reduce.memory.mb",
    "displayName": "Default virtual memory for a job's reduce-task",
    "displayType": "int",
    "unit": "MB",
    "category": "General",
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-site.xml"
  },
  {
    "id": "site property",
    "name": "mapreduce.task.io.sort.mb",
    "displayName": "Map-side sort buffer memory",
    "displayType": "int",
    "unit": "MB",
    "category": "General",
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-site.xml"
  },
  {
    "id": "site property",
    "name": "hadoop.security.auth_to_local",
    "displayName": "hadoop.security.auth_to_local",
    "displayType": "multiLine",
    "serviceName": "HDFS",
    "filename": "core-site.xml",
    "category": "Advanced core-site"
  },
  {
    "id": "site property",
    "name": "yarn.app.mapreduce.am.resource.mb",
    "displayName": "yarn.app.mapreduce.am.resource.mb",
    "displayType": "int",
    "category": "Advanced mapred-site",
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-site.xml"
  },

/**********************************************oozie-site***************************************/
  {
    "id": "site property",
    "name": "oozie.db.schema.name",
    "displayName": "Database Name",
    "isOverridable": false,
    "displayType": "host",
    "category": "OOZIE_SERVER",
    "serviceName": "OOZIE",
    "filename": "oozie-site.xml",
    "index": 4
  },
  {
    "id": "site property",
    "name": "oozie.service.JPAService.jdbc.username",
    "displayName": "Database Username",
    "isOverridable": false,
    "displayType": "user",
    "category": "OOZIE_SERVER",
    "serviceName": "OOZIE",
    "filename": "oozie-site.xml",
    "index": 5
  },
  {
    "id": "site property",
    "name": "oozie.service.JPAService.jdbc.password",
    "displayName": "Database Password",
    "isOverridable": false,
    "displayType": "password",
    "category": "OOZIE_SERVER",
    "serviceName": "OOZIE",
    "filename": "oozie-site.xml",
    "index": 6
  },
  {
    "id": "site property",
    "name": "oozie.service.JPAService.jdbc.driver", // the default value of this property is overriden in code
    "displayName": "JDBC Driver Class",
    "isOverridable": false,
    "category": "OOZIE_SERVER",
    "serviceName": "OOZIE",
    "filename": "oozie-site.xml",
    "index": 7
  },
  {
    "id": "site property",
    "name": "oozie.service.JPAService.jdbc.url",
    "displayName": "Database URL",
    "isOverridable": false,
    "displayType": "advanced",
    "category": "OOZIE_SERVER",
    "serviceName": "OOZIE",
    "filename": "oozie-site.xml",
    "index": 8
  },

/**********************************************hive-site***************************************/
  {
    "id": "site property",
    "name": "javax.jdo.option.ConnectionDriverName",  // the default value is overwritten in code
    "displayName": "JDBC Driver Class",
    "isOverridable": false,
    "category": "HIVE_METASTORE",
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "index": 7
  },
  {
    "id": "site property",
    "name": "hive.metastore.heapsize",  // the default value is overwritten in code
    "displayName": "Hive Metastore heapsize",
    "isOverridable": false,
    "category": "HIVE_METASTORE",
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "displayType": "int",
    "unit": "MB",
    "index": 11
  },
  {
    "id": "site property",
    "name": "hive.heapsize",
    "displayName": "HiveServer2 heap size",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "category": "HIVE_SERVER2",
    "index": 9
  },
  {
    "id": "site property",
    "name": "hive.client.heapsize",
    "displayName": "Hive Client heapsize",
    "isOverridable": false,
    "category": "HIVE_CLIENT",
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "displayType": "int",
    "unit": "MB",
    "index": 10
  },
  {
    "id": "site property",
    "name": "javax.jdo.option.ConnectionUserName",
    "displayName": "Database Username",
    "displayType": "user",
    "isOverridable": false,
    "category": "HIVE_METASTORE",
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "index": 5
  },
  {
    "id": "site property",
    "name": "javax.jdo.option.ConnectionPassword",
    "displayName": "Database Password",
    "displayType": "password",
    "isOverridable": false,
    "category": "HIVE_METASTORE",
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "index": 6
  },
  {
    "id": "site property",
    "name": "javax.jdo.option.ConnectionURL",
    "displayName": "Database URL",
    "displayType": "advanced",
    "isOverridable": false,
    "category": "HIVE_METASTORE",
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "index": 8
  },
  {
    "id": "site property",
    "name": "ambari.hive.db.schema.name",
    "displayName": "Database Name",
    "displayType": "host",
    "isOverridable": false,
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "category": "HIVE_METASTORE",
    "index": 4
  },
  {
    "id": "site property",
    "name": "hive.server2.tez.default.queues",
    "displayName": "hive.server2.tez.default.queues",
    "isRequired": false,
    "serviceName": "HIVE",
    "filename": "hive-site.xml",
    "category": "Advanced hive-site"
  },
  {
    "id": "site property",
    "name": "hive.server2.thrift.port",
    "displayName": "HiveServer2 Port",
    "description": "TCP port number to listen on, default 10000.",
    "recommendedValue": "10000",
    "displayType": "int",
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "category": "Advanced hive-site",
    "serviceName": "HIVE",
    "filename": "hive-site.xml"
  },
  {
    "id": "site property",
    "name": "hive.server2.support.dynamic.service.discovery",
    "displayName": "hive.server2.support.dynamic.service.discovery",
    "recommendedValue": true,
    "displayType": "checkbox",
    "category": "Advanced hive-site",
    "serviceName": "HIVE",
    "filename": "hive-site.xml"
  },
  {
    "id": "site property",
    "name": "hive.security.authorization.enabled",
    "displayName": "hive.security.authorization.enabled",
    "recommendedValue": false,
    "displayType": "checkbox",
    "category": "Advanced hive-site",
    "serviceName": "HIVE",
    "filename": "hive-site.xml"
  },
/**********************************************tez-site*****************************************/
  {
    "id": "site property",
    "name": "tez.am.resource.memory.mb",
    "displayName": "tez.am.resource.memory.mb",
    "displayType": "int",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.am.java.opts",
    "displayName": "tez.am.java.opts",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.am.grouping.split-waves",
    "displayName": "tez.am.grouping.split-waves",
    "displayType": "float",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.am.grouping.min-size",
    "displayName": "tez.am.grouping.min-size",
    "displayType": "int",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.am.grouping.max-size",
    "displayName": "tez.am.grouping.max-size",
    "displayType": "int",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.am.log.level",
    "displayName": "tez.am.log.level",
    "displayType": "string",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.runtime.intermediate-input.compress.codec",
    "displayName": "tez.runtime.intermediate-input.compress.codec",
    "displayType": "string",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.runtime.intermediate-input.is-compressed",
    "displayName": "tez.runtime.intermediate-input.is-compressed",
    "displayType": "checkbox",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.runtime.intermediate-output.compress.codec",
    "displayName": "tez.runtime.intermediate-output.compress.codec",
    "displayType": "string",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },
  {
    "id": "site property",
    "name": "tez.runtime.intermediate-output.should-compress",
    "displayName": "tez.runtime.intermediate-output.should-compress",
    "displayType": "checkbox",
    "category": "General",
    "serviceName": "TEZ",
    "filename": "tez-site.xml"
  },

/**********************************************hbase-site***************************************/
  {
    "id": "site property",
    "name": "hbase.tmp.dir",
    "displayName": "HBase tmp directory",
    "defaultDirectory": "/hadoop/hbase",
    "displayType": "directory",
    "category": "Advanced hbase-site",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.master.port",
    "displayName": "HBase Master Port",
    "isReconfigurable": true,
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "category": "Advanced hbase-site"
  },
  {
    "id": "site property",
    "name": "hbase.regionserver.global.memstore.upperLimit",
    "displayName": "hbase.regionserver.global.memstore.upperLimit",
    "displayType": "float",
    "category": "Advanced hbase-site",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.regionserver.global.memstore.lowerLimit",
    "displayName": "hbase.regionserver.global.memstore.lowerLimit",
    "displayType": "float",
    "category": "Advanced hbase-site",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.hstore.blockingStoreFiles",
    "displayName": "hstore blocking storefiles",
    "displayType": "int",
    "category": "Advanced hbase-site",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.hstore.compactionThreshold",
    "displayName": "HBase HStore compaction threshold",
    "displayType": "int",
    "category": "General",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 0
  },
  {
    "id": "site property",
    "name": "hfile.block.cache.size",
    "displayName": "HFile block cache size ",
    "displayType": "float",
    "category": "General",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 1
  },
  {
    "id": "site property",
    "name": "hbase.hregion.max.filesize",
    "displayName": "Maximum HStoreFile Size",
    "displayType": "int",
    "unit": "bytes",
    "category": "General",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 2
  },
  {
    "id": "site property",
    "name": "hbase.regionserver.handler.count",
    "displayName": "RegionServer Handler",
    "displayType": "int",
    "category": "HBASE_REGIONSERVER",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 2
  },
  {
    "id": "site property",
    "name": "hbase.hregion.majorcompaction",
    "displayName": "HBase Region Major Compaction Interval",
    "displayType": "int",
    "unit": "ms",
    "category": "HBASE_REGIONSERVER",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 3
  },
  {
    "id": "site property",
    "name": "hbase.hregion.memstore.block.multiplier",
    "displayName": "HBase Region Block Multiplier",
    "displayType": "int",
    "category": "HBASE_REGIONSERVER",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 4
  },
  {
    "id": "site property",
    "name": "hbase.hregion.memstore.mslab.enabled",
    "displayName": "hbase.hregion.memstore.mslab.enabled",
    "displayType": "checkbox",
    "category": "Advanced hbase-site",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.hregion.memstore.flush.size",
    "displayName": "HBase Region Memstore Flush Size",
    "displayType": "int",
    "unit": "bytes",
    "category": "HBASE_REGIONSERVER",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 5
  },
  {
    "id": "site property",
    "name": "hbase.client.scanner.caching",
    "displayName": "HBase Client Scanner Caching",
    "displayType": "int",
    "unit": "rows",
    "category": "General",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 3
  },
  {
    "id": "site property",
    "name": "zookeeper.session.timeout",
    "displayName": "Zookeeper timeout for HBase Session",
    "displayType": "int",
    "unit": "ms",
    "category": "General",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 4
  },
  {
    "id": "site property",
    "name": "hbase.client.keyvalue.maxsize",
    "displayName": "HBase Client Maximum key-value Size",
    "displayType": "int",
    "unit": "bytes",
    "category": "General",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "index": 5
  },
  {
    "id": "site property",
    "name": "hbase.coprocessor.region.classes",
    "displayName": "hbase.coprocessor.region.classes",
    "category": "Advanced hbase-site",
    "isRequired": false,
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.coprocessor.master.classes",
    "displayName": "hbase.coprocessor.master.classes",
    "category": "Advanced hbase-site",
    "isRequired": false,
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.coprocessor.regionserver.classes",
    "displayName": "hbase.coprocessor.regionserver.classes",
    "category": "Advanced hbase-site",
    "isRequired": false,
    "serviceName": "HBASE",
    "filename": "hbase-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.zookeeper.quorum",
    "displayName": "hbase.zookeeper.quorum",
    "displayType": "multiLine",
    "serviceName": "HBASE",
    "filename": "hbase-site.xml",
    "category": "Advanced hbase-site"
  },

/**********************************************storm-site***************************************/
  {
    "id": "site property",
    "name": "storm.zookeeper.root",
    "displayName": "storm.zookeeper.root",
    "displayType": "directory",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.local.dir",
    "displayName": "storm.local.dir",
    "defaultDirectory": "/hadoop/storm",
    "displayType": "directory",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.servers",
    "displayName": "storm.zookeeper.servers",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isReconfigurable": false,
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.port",
    "displayName": "storm.zookeeper.port",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.session.timeout",
    "displayName": "storm.zookeeper.session.timeout",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.connection.timeout",
    "displayName": "storm.zookeeper.connection.timeout",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.retry.times",
    "displayName": "storm.zookeeper.retry.times",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.retry.interval",
    "displayName": "storm.zookeeper.retry.interval",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General",
    "unit": "ms"
  },
  {
    "id": "site property",
    "name": "storm.zookeeper.retry.intervalceiling.millis",
    "displayName": "storm.zookeeper.retry.intervalceiling.millis",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General",
    "unit": "ms"
  },
  {
    "id": "site property",
    "name": "storm.cluster.mode",
    "displayName": "storm.cluster.mode",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.local.mode.zmq",
    "displayName": "storm.local.mode.zmq",
    "displayType": "checkbox",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.thrift.transport",
    "displayName": "storm.thrift.transport",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "storm.messaging.transport",
    "displayName": "storm.messaging.transport",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "General",
    "displayName": "storm.messaging.netty.buffer_size",
    "name": "storm.messaging.netty.buffer_size",
    "displayType": "int",
    "unit": "bytes",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "General",
    "displayName": "storm.messaging.netty.max_retries",
    "name": "storm.messaging.netty.max_retries",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "General",
    "displayName": "storm.messaging.netty.max_wait_ms",
    "name": "storm.messaging.netty.max_wait_ms",
    "displayType": "int",
    "unit": "ms",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "General",
    "displayName": "storm.messaging.netty.min_wait_ms",
    "name": "storm.messaging.netty.min_wait_ms",
    "displayType": "int",
    "unit": "ms",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "General",
    "displayName": "storm.messaging.netty.server_worker_threads",
    "name": "storm.messaging.netty.server_worker_threads",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "General",
    "displayName": "storm.messaging.netty.client_worker_threads",
    "name": "storm.messaging.netty.client_worker_threads",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "name": "nimbus.host",
    "displayName": "nimbus.host",
    "displayType": "masterHost",
    "isOverridable": false,
    "isReconfigurable": false,
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS"
  },
  {
    "id": "site property",
    "name": "nimbus.thrift.port",
    "displayName": "nimbus.thrift.port",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS"
  },
  {
    "id": "site property",
    "name": "nimbus.thrift.max_buffer_size",
    "displayName": "nimbus.thrift.max_buffer_size",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "bytes"
  },
  {
    "id": "site property",
    "name": "nimbus.childopts",
    "displayName": "nimbus.childopts",
    "displayType": "multiLine",
    "isOverridable": false,
    "serviceName": "STORM",
    "category": "NIMBUS",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "name": "nimbus.task.timeout.secs",
    "displayName": "nimbus.task.timeout.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.supervisor.timeout.secs",
    "displayName": "nimbus.supervisor.timeout.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.monitor.freq.secs",
    "displayName": "nimbus.monitor.freq.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.cleanup.inbox.freq.secs",
    "displayName": "nimbus.cleanup.inbox.freq.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.inbox.jar.expiration.secs",
    "displayName": "nimbus.inbox.jar.expiration.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.task.launch.secs",
    "displayName": "nimbus.task.launch.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.reassign",
    "displayName": "nimbus.reassign",
    "displayType": "checkbox",
    "isReconfigurable": true,
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS"
  },
  {
    "id": "site property",
    "name": "nimbus.file.copy.expiration.secs",
    "displayName": "nimbus.file.copy.expiration.secs",
    "displayType": "int",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS",
    "unit": "seconds"
  },
  {
    "id": "site property",
    "name": "nimbus.topology.validator",
    "displayName": "nimbus.topology.validator",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "NIMBUS"
  },
  {
    "id": "site property",
    "name": "supervisor.slots.ports",
    "displayName": "supervisor.slots.ports",
    "displayType": "string",
    "serviceName": "STORM",
    "filename": "storm-site.xml",
    "category": "SUPERVISOR"
  },
  {
    "id": "site property",
    "isOverridable": false,
    "serviceName": "STORM",
    "category": "SUPERVISOR",
    "displayName": "supervisor.childopts",
    "name": "supervisor.childopts",
    "displayType": "multiLine",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "SUPERVISOR",
    "displayName": "supervisor.worker.start.timeout.secs",
    "name": "supervisor.worker.start.timeout.secs",
    "displayType": "int",
    "unit": "seconds",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "SUPERVISOR",
    "displayName": "supervisor.worker.timeout.secs",
    "name": "supervisor.worker.timeout.secs",
    "displayType": "int",
    "unit": "seconds",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "SUPERVISOR",
    "displayName": "supervisor.monitor.frequency.secs",
    "name": "supervisor.monitor.frequency.secs",
    "displayType": "int",
    "unit": "seconds",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "SUPERVISOR",
    "displayName": "supervisor.heartbeat.frequency.secs",
    "name": "supervisor.heartbeat.frequency.secs",
    "displayType": "int",
    "unit": "seconds",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "DRPC_SERVER",
    "displayName": "drpc.port",
    "name": "drpc.port",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "DRPC_SERVER",
    "displayName": "drpc.worker.threads",
    "name": "drpc.worker.threads",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "DRPC_SERVER",
    "displayName": "drpc.queue.size",
    "name": "drpc.queue.size",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "DRPC_SERVER",
    "displayName": "drpc.invocations.port",
    "name": "drpc.invocations.port",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "DRPC_SERVER",
    "displayName": "drpc.request.timeout.secs",
    "name": "drpc.request.timeout.secs",
    "displayType": "int",
    "unit": "seconds",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "DRPC_SERVER",
    "displayName": "drpc.childopts",
    "name": "drpc.childopts",
    "displayType": "string",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "STORM_UI_SERVER",
    "displayName": "ui.port",
    "name": "ui.port",
    "displayType": "int",
    "filename": "storm-site.xml"
  },
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "STORM_UI_SERVER",
    "displayName": "ui.childopts",
    "name": "ui.childopts",
    "displayType": "string",
    "filename": "storm-site.xml"
  },
  //@Todo: uncomment following properties when logviewer is treated as different section on storm service page
  /*
   {
   "id": "site property",
   "serviceName": "STORM",
   "category": "LogviewerServer",
   "displayName": "logviewer.port",
   "name": "logviewer.port",
   "displayType": "int"
   },
   {
   "id": "site property",
   "serviceName": "STORM",
   "category": "LogviewerServer",
   "displayName": "logviewer.childopts",
   "name": "logviewer.childopts",
   "displayType": "string"
   },
   {
   "id": "site property",
   "serviceName": "STORM",
   "category": "LogviewerServer",
   "displayName": "logviewer.appender.name",
   "name": "logviewer.appender.name",
   "displayType": "string"
   },
   */
  {
    "id": "site property",
    "serviceName": "STORM",
    "category": "Advanced storm-site",
    "displayName": "worker.childopts",
    "name": "worker.childopts",
    "displayType": "multiLine",
    "filename": "storm-site.xml"
  },
/*********************************************oozie-site for Falcon*****************************/
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-job-submit-instances",
    "name": "oozie.service.ELService.ext.functions.coord-job-submit-instances",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-action-create-inst",
    "name": "oozie.service.ELService.ext.functions.coord-action-create-inst",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-action-create",
    "name": "oozie.service.ELService.ext.functions.coord-action-create",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-job-submit-data",
    "name": "oozie.service.ELService.ext.functions.coord-job-submit-data",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-action-start",
    "name": "oozie.service.ELService.ext.functions.coord-action-start",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-sla-submit",
    "name": "oozie.service.ELService.ext.functions.coord-sla-submit",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },
  {
    "id": "site property",
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "category": "Falcon - Oozie integration",
    "displayName": "oozie.service.ELService.ext.functions.coord-sla-create",
    "name": "oozie.service.ELService.ext.functions.coord-sla-create",
    "displayType": "custom",
    "filename": "oozie-site.xml"
  },

  // Runtime properties
  {
    "id": "site property",
    "name": "*.domain",
    "displayName": "*.domain",
    "category": "FalconRuntimeSite",
    "serviceName": "FALCON",
    "filename": "falcon-runtime.properties.xml"

  },
  {
    "id": "site property",
    "name": "*.log.cleanup.frequency.minutes.retention",
    "displayName": "*.log.cleanup.frequency.minutes.retention",
    "category": "FalconRuntimeSite",
    "serviceName": "FALCON",
    "filename": "falcon-runtime.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.log.cleanup.frequency.hours.retention",
    "displayName": "*.log.cleanup.frequency.hours.retention",
    "category": "FalconRuntimeSite",
    "serviceName": "FALCON",
    "filename": "falcon-runtime.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.log.cleanup.frequency.days.retention",
    "displayName": "*.log.cleanup.frequency.days.retention",
    "category": "FalconRuntimeSite",
    "serviceName": "FALCON",
    "filename": "falcon-runtime.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.log.cleanup.frequency.months.retention",
    "displayName": "*.log.cleanup.frequency.months.retention",
    "category": "FalconRuntimeSite",
    "serviceName": "FALCON",
    "filename": "falcon-runtime.properties.xml"
  },

  //  Startup properties

  {
    "id": "site property",
    "name": "*.domain",
    "displayName": "*.domain",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.workflow.engine.impl",
    "displayName": "*.workflow.engine.impl",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.oozie.process.workflow.builder",
    "displayName": "*.oozie.process.workflow.builder",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.oozie.feed.workflow.builder",
    "displayName": "*.oozie.feed.workflow.builder",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.SchedulableEntityManager.impl",
    "displayName": "*.SchedulableEntityManager.impl",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.ConfigSyncService.impl",
    "displayName": "*.ConfigSyncService.impl",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.ProcessInstanceManager.impl",
    "displayName": "*.ProcessInstanceManager.impl",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.catalog.service.impl",
    "displayName": "*.catalog.service.impl",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.application.services",
    "displayName": "*.application.services",
    "displayType": "multiLine",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.configstore.listeners",
    "displayName": "*.configstore.listeners",
    "displayType": "multiLine",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.broker.impl.class",
    "displayName": "*.broker.impl.class",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.shared.libs",
    "displayName": "*.shared.libs",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.config.store.uri",
    "displayName": "*.config.store.uri",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.system.lib.location",
    "displayName": "*.system.lib.location",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.retry.recorder.path",
    "displayName": "*.retry.recorder.path",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.cleanup.service.frequency",
    "displayName": "*.falcon.cleanup.service.frequency",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.broker.url",
    "displayName": "*.broker.url",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.broker.ttlInMins",
    "displayName": "*.broker.ttlInMins",
    "displayType": "int",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.entity.topic",
    "displayName": "*.entity.topic",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.max.retry.failure.count",
    "displayName": "*.max.retry.failure.count",
    "displayType": "int",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.internal.queue.size",
    "displayName": "*.internal.queue.size",
    "displayType": "int",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.authentication.type",
    "displayName": "*.falcon.authentication.type",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.http.authentication.type",
    "displayName": "*.falcon.http.authentication.type",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.http.authentication.token.validity",
    "displayName": "*.falcon.http.authentication.token.validity",
    "displayType": "int",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.http.authentication.signature.secret",
    "displayName": "*.falcon.http.authentication.signature.secret",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.http.authentication.simple.anonymous.allowed",
    "displayName": "*.falcon.http.authentication.simple.anonymous.allowed",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.http.authentication.kerberos.name.rules",
    "displayName": "*.falcon.http.authentication.kerberos.name.rules",
    "category": "FalconStartupSite",
    "displayType": "multiLine",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.http.authentication.blacklisted.users",
    "displayName": "*.falcon.http.authentication.blacklisted.users",
    "isRequired": false,
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },

  // Falcon Graph and Storage
  {
    "id": "site property",
    "name": "*.falcon.graph.storage.directory",
    "displayName": "*.falcon.graph.storage.directory",
    "defaultDirectory": "/hadoop/falcon/data/lineage/graphdb",
    "displayType": "directory",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.graph.serialize.path",
    "displayName": "*.falcon.graph.serialize.path",
    "defaultDirectory": "/hadoop/falcon/data/lineage",
    "displayType": "directory",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },
  {
    "id": "site property",
    "name": "*.falcon.graph.preserve.history",
    "displayName": "*.falcon.graph.preserve.history",
    "recommendedValue": false,
    "displayType": "checkbox",
    "category": "FalconStartupSite",
    "serviceName": "FALCON",
    "filename": "falcon-startup.properties.xml"
  },

/**********************************************webhcat-site***************************************/
  {
    "id": "site property",
    "name": "templeton.hive.archive",
    "displayName": "templeton.hive.archive",
    "isRequired": false,
    "serviceName": "HIVE",
    "filename": "webhcat-site.xml",
    "category": "Advanced webhcat-site"
  },
  {
    "id": "site property",
    "name": "templeton.pig.archive",
    "displayName": "templeton.pig.archive",
    "isRequired": false,
    "serviceName": "HIVE",
    "filename": "webhcat-site.xml",
    "category": "Advanced webhcat-site"
  },
  {
    "id": "site property",
    "name": "templeton.zookeeper.hosts",
    "displayName": "templeton.zookeeper.hosts",
    "displayType": "multiLine",
    "serviceName": "HIVE",
    "filename": "webhcat-site.xml",
    "category": "Advanced webhcat-site"
  },
/**********************************************pig.properties*****************************************/
  {
    "id": "site property",
    "name": "content",
    "displayName": "content",
    "value": "",
    "recommendedValue": "",
    "description": "pig properties",
    "displayType": "content",
    "isRequired": false,
    "showLabel": false,
    "serviceName": "PIG",
    "filename": "pig-properties.xml",
    "category": "Advanced pig-properties"
  },

/**********************************************KNOX*****************************************/
  {
    "id": "site property",
    "name": "content",
    "displayName": "content",
    "value": "",
    "recommendedValue": "",
    "displayType": "content",
    "isRequired": false,
    "showLabel": false,
    "serviceName": "KNOX",
    "filename": "topology.xml",
    "category": "Advanced topology"
  },

  {
    "id": "site property",
    "name": "content",
    "displayName": "content",
    "value": "",
    "recommendedValue": "",
    "displayType": "content",
    "isRequired": false,
    "showLabel": false,
    "serviceName": "KNOX",
    "filename": "users-ldif.xml",
    "category": "Advanced users-ldif"
  },
  {
    "id": "puppet var",
    "name": "knox_gateway_host",
    "displayName": "Knox Gateway host",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that have been assigned to run Knox Gateway",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "KNOX",
    "filename": "knox-env.xml",
    "category": "KNOX_GATEWAY",
    "index": 0
  },
  {
    "id": "site property",
    "name": "knox_master_secret",
    "displayName": "Knox Master Secret",
    "value": "",
    "recommendedValue": "",
    "displayType": "password",
    "isReconfigurable": false,
    "isOverridable": false,
    "isRequired": true,
    "serviceName": "KNOX",
    "filename": "knox-env.xml",
    "category": "KNOX_GATEWAY"
  },
  {
    "id": "puppet var",
    "name": "knox_pid_dir",
    "displayName": "Knox PID dir",
    "value": "",
    "displayType": "directory",
    "isReconfigurable": false,
    "isOverridable": false,
    "serviceName": "KNOX",
    "filename": "knox-env.xml",
    "category": "Advanced knox-env"
  },

/********************************************* KAFKA *****************************/
  {
    "id": "puppet var",
    "name": "kafka_broker_hosts",
    "displayName": "Kafka Broker host",
    "value": "",
    "recommendedValue": "",
    "description": "The host that has been assigned to run Kafka Broker",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER",
    "index": 0
  },
  {
    "id": "site property",
    "name": "log.dirs",
    "displayName": "log.dirs",
    "value": "",
    "recommendedValue": "",
    "defaultDirectory": "/kafka-logs",
    "displayType": "directories",
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER",
    "index": 0
  },
  {
    "id": "site property",
    "name": "port",
    "displayName": "port",
    "value": "",
    "recommendedValue": "",
    "displayType": "int",
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER",
    "index": 0
  },
    {
    "id": "site property",
    "name": "listeners",
    "displayName": "listeners",
    "value": "",
    "recommendedValue": "",
    "displayType": "advanced",
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER"
  },
  {
    "id": "site property",
    "name": "log.roll.hours",
    "displayName": "log.roll.hours",
    "value": "",
    "recommendedValue": "",
    "displayType": "advanced",
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER",
    "index": 0
  },
  {
    "id": "site property",
    "name": "log.retention.hours",
    "displayName": "log.retention.hours",
    "value": "",
    "recommendedValue": "",
    "displayType": "advanced",
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER",
    "index": 0
  },
  {
    "id": "site property",
    "name": "zookeeper.connect",
    "displayName": "zookeeper.connect",
    "value": "",
    "recommendedValue": "",
    "displayType": "advanced",
    "serviceName": "KAFKA",
    "filename": "kafka-broker.xml",
    "category": "KAFKA_BROKER",
    "index": 0
  },
  {
    "id": "site property",
    "name": "kafka_pid_dir",
    "displayName": "Kafka PID dir",
    "value": "",
    "recommendedValue": "",
    "isReconfigurable": false,
    "isOverridable": false,
    "displayType": "directory",
    "serviceName": "KAFKA",
    "filename": "kafka-env.xml",
    "category": "Advanced kafka-env",
    "index": 0
  },

/********************************************* ACCUMULO *****************************/
  {
    "id": "site property",
    "name": "accumulo_instance_name",
    "displayName": "Instance Name",
    "displayType": "string",
    "isOverridable": false,
    "isReconfigurable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "accumulo_root_password",
    "displayName": "Accumulo root password",
    "displayType": "password",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "trace.user",
    "displayName": "Trace user",
    "displayType": "string",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "trace_password",
    "displayName": "Trace user password",
    "displayType": "password",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "instance_secret",
    "displayName": "Instance Secret",
    "displayType": "password",
    "isOverridable": false,
    "isReconfigurable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "server_content",
    "displayName": "Server accumulo-env template",
    "displayType": "content",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_master_heapsize",
    "displayName": "Accumulo Master Maximum Java heap size",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_tserver_heapsize",
    "displayName": "Accumulo TServer Maximum Java heap size",
    "displayType": "int",
    "unit": "MB",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_monitor_heapsize",
    "displayName": "Accumulo Monitor Maximum Java heap size",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_gc_heapsize",
    "displayName": "Accumulo GC Maximum Java heap size",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_other_heapsize",
    "displayName": "Accumulo Other Maximum Java heap size",
    "displayType": "int",
    "unit": "MB",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_log_dir",
    "displayName": "Accumulo Log Dir",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_pid_dir",
    "displayName": "Accumulo PID Dir",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "puppet var",
    "name": "accumulo_monitor_bind_all",
    "displayName": "Monitor Bind All Interfaces",
    "displayType": "checkbox",
    "recommendedValue": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-env.xml",
    "category": "Advanced accumulo-env"
  },
  {
    "id": "site property",
    "name": "instance.volumes",
    "displayName": "instance.volumes",
    "displayType": "string",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 0
  },
  {
    "id": "site property",
    "name": "instance.zookeeper.host",
    "displayName": "instance.zookeeper.host",
    "displayType": "string",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 1
  },
  {
    "id": "site property",
    "name": "instance.zookeeper.timeout",
    "displayName": "instance.zookeeper.timeout",
    "displayType": "string",
    "isOverridable": false,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 2
  },
  {
    "id": "site property",
    "name": "master.port.client",
    "displayName": "master.port.client",
    "displayType": "int",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 3
  },
  {
    "id": "site property",
    "name": "tserver.port.client",
    "displayName": "tserver.port.client",
    "displayType": "int",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 4
  },
  {
    "id": "site property",
    "name": "monitor.port.client",
    "displayName": "monitor.port.client",
    "displayType": "int",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 5
  },
  {
    "id": "site property",
    "name": "monitor.port.log4j",
    "displayName": "monitor.port.log4j",
    "displayType": "int",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 6
  },
  {
    "id": "site property",
    "name": "gc.port.client",
    "displayName": "gc.port.client",
    "displayType": "int",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 7
  },
  {
    "id": "site property",
    "name": "trace.port.client",
    "displayName": "trace.port.client",
    "displayType": "int",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 8
  },
  {
    "id": "site property",
    "name": "tserver.memory.maps.native.enabled",
    "displayName": "tserver.memory.maps.native.enabled",
    "displayType": "checkbox",
    "recommendedValue": true,
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 9
  },
  {
    "id": "site property",
    "name": "general.classpaths",
    "displayName": "general.classpaths",
    "displayType": "content",
    "serviceName": "ACCUMULO",
    "filename": "accumulo-site.xml",
    "category": "Advanced accumulo-site",
    "index": 10
  },

/*******************************************kerberos***********************************/
  {
    "id": "puppet var",
    "name": "kdc_type",
    "displayName": "KDC type",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "displayType": "masterHost",
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "KDC",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "kdc_host",
    "displayName": "KDC host",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "displayType": "supportTextConnection",
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "KDC",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "realm",
    "displayName": "Realm name",
    "displayType": "host",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "isReconfigurable": false,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "KDC",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "ldap_url",
    "displayName": "LDAP url",
    "displayType": "host",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "KDC",
    "index": 3
  },
  {
    "id": "puppet var",
    "name": "container_dn",
    "displayName": "Container DN",
    "isVisible": false,
    "isOverridable": false,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "KDC",
    "index": 4
  },
  {
    "id": "puppet var",
    "name": "manage_identities",
    "displayName": "Manage Kerberos Identities",
    "displayType": "checkbox",
    "isVisible": false,
    "isOverridable": false,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 0
  },
  {
    "id": "puppet var",
    "name": "install_packages",
    "displayName": "Install OS-specific Kerberos client package(s)",
    "displayType": "checkbox",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 1
  },
  {
    "id": "puppet var",
    "name": "executable_search_paths",
    "displayName": "Executable Search Paths",
    "displayType": "multiline",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 2
  },
  {
    "id": "puppet var",
    "name": "encryption_types",
    "displayName": "Encryption Types",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "displayType": "multiLine",
    "category": "Advanced kerberos-env",
    "index" : 3
  },
  {
    "id": "puppet var",
    "name": "password_length",
    "displayName": "Password Length",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 4
  },
  {
    "id": "puppet var",
    "name": "password_min_lowercase_letters",
    "displayName": "Password Minimum # Lowercase Letters",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 5
  },
  {
    "id": "puppet var",
    "name": "password_min_uppercase_letters",
    "displayName": "Password Minimum # Uppercase Letters",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 6
  },
  {
    "id": "puppet var",
    "name": "password_min_digits",
    "displayName": "Password Minimum # Digits",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 7
  },
  {
    "id": "puppet var",
    "name": "password_min_punctuation",
    "displayName": "Password Minimum # Punctuation Characters",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 8
  },
  {
    "id": "puppet var",
    "name": "password_min_whitespace",
    "displayName": "Password Minimum # Whitespace Characters",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 9
  },
  {
    "id": "puppet var",
    "name": "service_check_principal_name",
    "displayName": "Test Kerberos Principal",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 10
  },
  {
    "id": "puppet var",
    "name": "ad_create_attributes_template",
    "displayName": "Account Attribute Template",
    "displayType": "content",
    "isOverridable": false,
    "isVisible": true,
    "isRequired": false,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 11
  },
  {
    "id": "puppet var",
    "name": "kdc_create_attributes",
    "displayName": "Principal Attributes",
    "isOverridable": false,
    "isVisible": true,
    "isRequired": false,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 12
  },
  {
    "id": "puppet var",
    "name": "case_insensitive_username_rules",
    "displayName": "Enable case insensitive username rules",
    "displayType": "checkbox",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Advanced kerberos-env",
    "index" : 13
  },
  {
    "id": "puppet var",
    "name": "domains",
    "displayName": "Domains",
    "isRequired": false,
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "KERBEROS",
    "filename": "krb5-conf.xml",
    "category": "KDC",
    "index": 5
  },
  {
    "id": "puppet var",
    "name": "admin_server_host",
    "displayName": "Kadmin host",
    "displayType": "host",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "KERBEROS",
    "filename": "kerberos-env.xml",
    "category": "Kadmin",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "admin_principal",
    "displayName": "Admin principal",
    "description": "Admin principal used to create principals and export key tabs (e.g. admin/admin@EXAMPLE.COM).",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "KERBEROS",
    "filename": "krb5-conf.xml",
    "category": "Kadmin",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "admin_password",
    "displayName": "Admin password",
    "displayType": "password",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "KERBEROS",
    "filename": "krb5-conf.xml",
    "category": "Kadmin",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "manage_krb5_conf",
    "displayName": "Manage Kerberos client krb5.conf",
    "displayType": "checkbox",
    "isOverridable": false,
    "isVisible": true,
    "dependentConfigPattern": "CATEGORY",
    "serviceName": "KERBEROS",
    "filename": "krb5-conf.xml",
    "category": "Advanced krb5-conf",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "conf_dir",
    "displayName": "krb5-conf directory path",
    "value": "",
    "recommendedValue": "",
    "description": "",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "displayType": "directory",
    "serviceName": "KERBEROS",
    "filename": "krb5-conf.xml",
    "category": "Advanced krb5-conf",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "content",
    "displayName": "krb5-conf template",
    "value": "",
    "recommendedValue": "",
    "description": "",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "displayType": "content",
    "serviceName": "KERBEROS",
    "filename": "krb5-conf.xml",
    "category": "Advanced krb5-conf",
    "index": 2
  },
/********************************************* flume-agent *****************************/
  {
    "id": "site property",
    "name": "content",
    "displayName": "content",
    "showLabel": false,
    "isRequired": false,
    "displayType": "content",
    "serviceName": "FLUME",
    "category": "FLUME_HANDLER",
    "filename": "flume-conf.xml"
  },
  {
    "id": "puppet var",
    "name": "flume_conf_dir",
    "displayName": "Flume Conf Dir",
    "description": "Location to save configuration files",
    "recommendedValue": "/etc/flume/conf",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "FLUME",
    "filename": "flume-env.xml",
    "category": "Advanced flume-env",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "flume_log_dir",
    "displayName": "Flume Log Dir",
    "description": "Location to save log files",
    "recommendedValue": "/var/log/flume",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "FLUME",
    "filename": "flume-env.xml",
    "category": "Advanced flume-env",
    "index": 1
  },
/**********************************************HDFS***************************************/
  {
    "id": "puppet var",
    "name": "namenode_host",
    "displayName": "NameNode hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that has been assigned to run NameNode",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NAMENODE",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "namenode_heapsize",
    "displayName": "NameNode Java heap size",
    "description": "Initial and maximum Java heap size for NameNode (Java options -Xms and -Xmx).  This also applies to the Secondary NameNode.",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NAMENODE",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_newsize",
    "displayName": "NameNode new generation size",
    "description": "Default size of Java new generation for NameNode (Java option -XX:NewSize).  This also applies to the Secondary NameNode.",
    "recommendedValue": "200",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NAMENODE",
    "index": 3
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_permsize",
    "displayName": "NameNode permanent generation size",
    "description": "Default size of Java permanent generation for NameNode (Java option -XX:PermSize).  This also applies to the Secondary NameNode.",
    "recommendedValue": "128",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NAMENODE",
    "index": 5
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_maxpermsize",
    "displayName": "NameNode maximum permanent generation size",
    "description": "Maximum size of Java permanent generation for NameNode (Java option -XX:MaxPermSize).",
    "recommendedValue": "256",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NAMENODE",
    "index": 6
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_maxnewsize",
    "displayName": "NameNode maximum new generation size",
    "description": "Maximum size of Java new generation for NameNode (Java option -XX:MaxnewSize).",
    "recommendedValue": "200",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NAMENODE",
    "index": 4
  },
  {
    "id": "puppet var",
    "name": "snamenode_host",
    "displayName": "SNameNode host",
    "value": "",
    "recommendedValue": "",
    "description": "The host that has been assigned to run SecondaryNameNode",
    "displayType": "masterHost",
    "isOverridable": false,
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "SECONDARY_NAMENODE",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "datanode_hosts", //not in the schema. For UI purpose
    "displayName": "DataNode hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that have been assigned to run DataNode",
    "displayType": "slaveHosts",
    "isRequired": false,
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "DATANODE",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "dtnode_heapsize",
    "displayName": "DataNode maximum Java heap size",
    "description": "Maximum Java heap size for DataNode (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "DATANODE",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "nfsgateway_hosts", //not in the schema. For UI purpose
    "displayName": "NFSGateway hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that have been assigned to run NFSGateway",
    "displayType": "slaveHosts",
    "isRequired": false,
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NFS_GATEWAY",
    "index": 0
  },
    {
    "id": "puppet var",
    "name": "nfsgateway_heapsize",
    "displayName": "NFSGateway maximum Java heap size",
    "description": "Maximum Java heap size for NFSGateway (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "NFS_GATEWAY",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "hadoop_heapsize",
    "displayName": "Hadoop maximum Java heap size",
    "description": "Maximum Java heap size for daemons such as Balancer (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "General",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "hdfs_log_dir_prefix",
    "displayName": "Hadoop Log Dir Prefix",
    "description": "The parent directory for Hadoop log files.  The HDFS log directory will be ${hadoop_log_dir_prefix} / ${hdfs_user} and the MapReduce log directory will be ${hadoop_log_dir_prefix} / ${mapred_user}.",
    "recommendedValue": "/var/log/hadoop",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "Advanced hadoop-env"
  },
  {
    "id": "puppet var",
    "name": "hadoop_pid_dir_prefix",
    "displayName": "Hadoop PID Dir Prefix",
    "description": "The parent directory in which the PID files for Hadoop processes will be created.  The HDFS PID directory will be ${hadoop_pid_dir_prefix} / ${hdfs_user} and the MapReduce PID directory will be ${hadoop_pid_dir_prefix} / ${mapred_user}.",
    "recommendedValue": "/var/run/hadoop",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "Advanced hadoop-env"
  },
  {
    "id": "puppet var",
    "name": "hadoop_root_logger",
    "displayName": "Hadoop Root Logger",
    "description": "Hadoop logging options",
    "recommendedValue": "INFO,RFA",
    "displayType": "string",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HDFS",
    "filename": "hadoop-env.xml",
    "category": "Advanced hadoop-env"
  },

/**********************************************MAPREDUCE2***************************************/
  {
    "id": "puppet var",
    "name": "hs_host",
    "displayName": "History Server",
    "description": "History Server",
    "recommendedValue": "",
    "isOverridable": false,
    "displayType": "masterHost",
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-env.xml",
    "category": "HISTORYSERVER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "jobhistory_heapsize",
    "displayName": "History Server heap size",
    "description": "History Server heap size",
    "recommendedValue": "900",
    "unit": "MB",
    "isOverridable": true,
    "displayType": "int",
    "isVisible": true,
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-env.xml",
    "category": "HISTORYSERVER",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "mapred_log_dir_prefix",
    "displayName": "Mapreduce Log Dir Prefix",
    "description": "",
    "recommendedValue": "/var/log/hadoop-mapreduce",
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isReconfigurable": false,
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-env.xml",
    "category": "Advanced mapred-env"
  },
  {
    "id": "puppet var",
    "name": "mapred_pid_dir_prefix",
    "displayName": "Mapreduce PID Dir Prefix",
    "description": "",
    "recommendedValue": "/var/run/hadoop-mapreduce",
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isReconfigurable": false,
    "serviceName": "MAPREDUCE2",
    "filename": "mapred-env.xml",
    "category": "Advanced mapred-env"
  },
/**********************************************YARN***************************************/
  {
    "id": "puppet var",
    "name": "yarn_heapsize",
    "displayName": "YARN Java heap size",
    "description": "Max heapsize for all YARN components",
    "recommendedValue": "1024",
    "isOverridable": true,
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "General",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "rm_host",
    "displayName": "ResourceManager",
    "description": "ResourceManager",
    "recommendedValue": "",
    "isOverridable": false,
    "displayType": "masterHost",
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "RESOURCEMANAGER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "resourcemanager_heapsize",
    "displayName": "ResourceManager Java heap size",
    "description": "Max heapsize for ResourceManager",
    "recommendedValue": "1024",
    "isOverridable": false,
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "RESOURCEMANAGER",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "nm_hosts",
    "displayName": "NodeManager",
    "description": "List of NodeManager Hosts.",
    "recommendedValue": "",
    "isOverridable": false,
    "displayType": "slaveHosts",
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "NODEMANAGER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "nodemanager_heapsize",
    "displayName": "NodeManager Java heap size",
    "description": "Max heapsize for NodeManager",
    "recommendedValue": "1024",
    "isOverridable": true,
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "NODEMANAGER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "yarn_log_dir_prefix",
    "displayName": "YARN Log Dir Prefix",
    "description": "",
    "recommendedValue": "/var/log/hadoop-yarn",
    "displayType": "directory",
    "isOverridable": false,
    "isReconfigurable": false,
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "Advanced yarn-env"
  },
  {
    "id": "puppet var",
    "name": "yarn_pid_dir_prefix",
    "displayName": "YARN PID Dir Prefix",
    "description": "",
    "recommendedValue": "/var/run/hadoop-yarn",
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isReconfigurable": false,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "Advanced yarn-env"
  },
  {
    "id": "puppet var",
    "name": "min_user_id",
    "displayName": "Minimum user ID for submitting job",
    "isOverridable": true,
    "displayType": "int",
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "Advanced yarn-env"
  },
  {
    "id": "puppet var",
    "name": "ats_host",
    "displayName": "App Timeline Server",
    "description": "Application Timeline Server Host",
    "recommendedValue": "",
    "isOverridable": false,
    "displayType": "masterHost",
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "APP_TIMELINE_SERVER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "apptimelineserver_heapsize",
    "displayName": "AppTimelineServer Java heap size",
    "description": "AppTimelineServer Java heap size",
    "recommendedValue": "1024",
    "isOverridable": false,
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "YARN",
    "filename": "yarn-env.xml",
    "category": "APP_TIMELINE_SERVER",
    "index": 1
  },
/**********************************************HBASE***************************************/
  {
    "id": "puppet var",
    "name": "hbasemaster_host",
    "displayName": "HBase Master hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The host that has been assigned to run HBase Master",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "HBASE_MASTER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "hbase_master_heapsize",
    "displayName": "HBase Master Maximum Java heap size",
    "description": "Maximum Java heap size for HBase master (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": true,
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "HBASE_MASTER",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "regionserver_hosts",
    "displayName": "RegionServer hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that have been assigned to run RegionServer",
    "displayType": "slaveHosts",
    "isOverridable": false,
    "isRequiredByAgent": false,
    "isVisible": true,
    "isRequired": false,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "HBASE_REGIONSERVER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "hbase_regionserver_heapsize",
    "displayName": "RegionServers maximum Java heap size",
    "description": "Maximum Java heap size for RegionServers (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "HBASE_REGIONSERVER",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "hbase_regionserver_xmn_max",
    "displayName": "RegionServers maximum value for -Xmn",
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "HBASE_REGIONSERVER",
    "index": 6
  },
  {
    "id": "puppet var",
    "name": "hbase_regionserver_xmn_ratio",
    "displayName": "RegionServers -Xmn in -Xmx ratio",
    "displayType": "float",
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "HBASE_REGIONSERVER",
    "index": 7
  },
  {
    "id": "puppet var",
    "name": "hbase_log_dir",
    "displayName": "HBase Log Dir",
    "description": "Directory for HBase logs",
    "recommendedValue": "/var/log/hbase",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "Advanced hbase-env"
  },
  {
    "id": "puppet var",
    "name": "hbase_pid_dir",
    "displayName": "HBase PID Dir",
    "description": "Directory in which the pid files for HBase processes will be created",
    "recommendedValue": "/var/run/hbase",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HBASE",
    "filename": "hbase-env.xml",
    "category": "Advanced hbase-env"
  },
  //***************************************** GLUSTERFS stack********************************************
  {
    "id": "site property",
    "name": "fs.glusterfs.impl",
    "displayName": "GlusterFS fs impl",
    "displayType": "string",
    "filename": "core-site.xml",
    "serviceName": "GLUSTERFS",
    "category": "General"
  },
  {
    "id": "site property",
    "name": "fs.AbstractFileSystem.glusterfs.impl",
    "displayName": "GlusterFS Abstract File System Implementation",
    "displayType": "string",
    "filename": "core-site.xml",
    "serviceName": "GLUSTERFS",
    "category": "General"
  },
/**********************************************GLUSTERFS***************************************/
  {
    "id": "puppet var",
    "name": "fs_glusterfs_default_name",
    "displayName": "GlusterFS default fs name 1.x Hadoop",
    "description": "GlusterFS default filesystem name (glusterfs://{MasterFQDN}:9000)",
    "recommendedValue": "glusterfs:///localhost:8020",
    "displayType": "string",
    "isVisible": true,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "glusterfs_defaultFS_name",
    "displayName": "GlusterFS default fs name 2.x Hadoop",
    "description": "GlusterFS default filesystem name (glusterfs:///)",
    "recommendedValue": "glusterfs:///localhost:8020",
    "displayType": "string",
    "isVisible": true,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "hadoop_heapsize",
    "displayName": "Hadoop maximum Java heap size",
    "description": "Maximum Java heap size for daemons such as Balancer (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isVisible": true,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "hdfs_log_dir_prefix",
    "displayName": "Hadoop Log Dir Prefix",
    "description": "The parent directory for Hadoop log files.  The HDFS log directory will be ${hadoop_log_dir_prefix} / ${hdfs_user} and the MapReduce log directory will be ${hadoop_log_dir_prefix} / ${mapred_user}.",
    "recommendedValue": "/var/log/hadoop",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "hadoop_pid_dir_prefix",
    "displayName": "Hadoop PID Dir Prefix",
    "description": "The parent directory in which the PID files for Hadoop processes will be created.  The HDFS PID directory will be ${hadoop_pid_dir_prefix} / ${hdfs_user} and the MapReduce PID directory will be ${hadoop_pid_dir_prefix} / ${mapred_user}.",
    "recommendedValue": "/var/run/hadoop",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "namenode_heapsize",
    "displayName": "Name Node Heap Size",
    "description": "Name Node Heap Size, default jvm memory setting",
    "recommendedValue": "1024",
    "isReconfigurable": false,
    "displayType": "int",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_newsize",
    "displayName": "NameNode new generation size",
    "description": "Default size of Java new generation for NameNode (Java option -XX:NewSize).  This also applies to the Secondary NameNode.",
    "recommendedValue": "200",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_maxnewsize",
    "displayName": "NameNode maximum new generation size",
    "description": "Maximum size of Java new generation for NameNode (Java option -XX:MaxnewSize).",
    "recommendedValue": "200",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_permsize",
    "displayName": "NameNode permanent generation size",
    "description": "Default size of Java permanent generation for NameNode (Java option -XX:PermSize).  This also applies to the Secondary NameNode.",
    "recommendedValue": "128",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "namenode_opt_maxpermsize",
    "displayName": "NameNode maximum permanent generation size",
    "description": "Maximum size of Java permanent generation for NameNode (Java option -XX:MaxPermSize).",
    "recommendedValue": "256",
    "displayType": "int",
    "unit": "MB",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "dtnode_heapsize",
    "displayName": "DataNode maximum Java heap size",
    "description": "Maximum Java heap size for DataNode (Java option -Xmx)",
    "recommendedValue": "1024",
    "displayType": "int",
    "unit": "MB",
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "glusterfs_user",
    "displayName": "glusterfs user",
    "description": "glusterfs user",
    "recommendedValue": "root",
    "displayType": "string",
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "namenode_host",
    "displayName": "NameNode Host",
    "description": "NameNode Host.",
    "recommendedValue": "",
    "displayType": "string",
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
  {
    "id": "puppet var",
    "name": "snamenode_host",
    "displayName": "Secondary NameNode Host",
    "description": "Secondary NameNode Host.",
    "recommendedValue": "",
    "displayType": "string",
    "isVisible": false,
    "serviceName": "GLUSTERFS",
    "filename": "hadoop-env.xml",
    "category": "General Hadoop"
  },
/**********************************************HIVE***************************************/
  {
    "id": "puppet var",
    "name": "hivemetastore_host",
    "displayName": "Hive Metastore hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that have been assigned to run Hive Metastore",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "HIVE_METASTORE",
    "index": 0
  },
  {
    "name": "hive_master_hosts",
    "value": "",
    "recommendedValue": "",
    "isOverridable": false,
    "isRequiredByAgent": false,
    "isVisible": false,
    "serviceName": "HIVE",
    "filename": "hive-env.xml"
  },
  {
    "id": "puppet var",
    "name": "hive_ambari_database",
    "displayName": "Database Type",
    "value": "",
    "recommendedValue": "MySQL",
    "description": "MySQL will be installed by Ambari",
    "displayType": "masterHost",
    "isOverridable": false,
    "isReconfigurable": false,
    "isRequiredByAgent": false,
    "isVisible": false,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "HIVE_METASTORE",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "hive_database",
    "displayName": "Hive Database",
    "value": "",
    "recommendedValue": "New MySQL Database",
    "options": [
      {
        displayName: 'New MySQL Database',
        hidden: false
      },
      {
        displayName: 'Existing MySQL Database',
        hidden: false
      },
      {
        displayName: 'Existing PostgreSQL Database',
        hidden: false
      },
      {
        displayName: 'Existing Oracle Database',
        hidden: false
      },
      {
        displayName: 'Existing SQLA Database',
        hidden: !App.get('isHadoop23Stack')
      }
    ],
    "description": "MySQL will be installed by Ambari",
    "displayType": "radio button",
    "isReconfigurable": true,
    "radioName": "hive-database",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "HIVE_METASTORE",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "hive_hostname",
    "displayName": "Database Host",
    "description": "Specify the host on which the database is hosted",
    "recommendedValue": "",
    "isReconfigurable": true,
    "displayType": "host",
    "isOverridable": false,
    "isRequiredByAgent": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "HIVE_METASTORE",
    "index": 3
  },
  {
    "id": "puppet var",
    "name": "hive_ambari_host",
    "value": "",
    "recommendedValue": "",
    "displayName": "Database Host",
    "description": "Host on which the database will be created by Ambari",
    "isReconfigurable": false,
    "displayType": "masterHost",
    "isOverridable": false,
    "isVisible": false,
    "isRequiredByAgent": false,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "HIVE_METASTORE",
    "index": 3
  },
  {
    "id": "puppet var",
    "name": "hive_metastore_port",
    "displayName": "Hive metastore port",
    "description": "",
    "recommendedValue": "9083",
    "isReconfigurable": false,
    "displayType": "int",
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced hive-env"
  },
  {
    "id": "puppet var",
    "name": "hive_lib",
    "displayName": "Hive library",
    "description": "",
    "recommendedValue": "/usr/lib/hive/lib/",
    "isReconfigurable": false,
    "displayType": "directory",
    "isVisible": false,
    "isRequiredByAgent": false, // Make this to true when we expose the property on ui by making "isVisible": true
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced hive-env"
  },
  {
    "id": "puppet var",
    "name": "hive_dbroot",
    "displayName": "Hive db directory",
    "description": "",
    "recommendedValue": "/usr/lib/hive/lib",
    "isReconfigurable": false,
    "displayType": "directory",
    "isVisible": false,
    "isRequiredByAgent": false, // Make this to true when we expose the property on ui by making "isVisible": true
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced hive-env"
  },
  {
    "id": "puppet var",
    "name": "hive_log_dir",
    "displayName": "Hive Log Dir",
    "description": "Directory for Hive log files",
    "recommendedValue": "/var/log/hive",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced hive-env"
  },
  {
    "id": "puppet var",
    "name": "hive_pid_dir",
    "displayName": "Hive PID Dir",
    "description": "Directory in which the PID files for Hive processes will be created",
    "recommendedValue": "/var/run/hive",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced hive-env"
  },
/**********************************************HIVE***************************************/
  {
    "id": "puppet var",
    "name": "webhcatserver_host",
    "displayName": "WebHCat Server host",
    "value": "",
    "recommendedValue": "",
    "description": "The host that has been assigned to run WebHCat Server",
    "displayType": "masterHost",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "HIVE",
    "filename": "webhcat-env.xml",
    "category": "WEBHCAT_SERVER"
  },
  {
    "id": "puppet var",
    "name": "hcat_log_dir",
    "displayName": "WebHCat Log Dir",
    "description": "Directory for WebHCat log files",
    "recommendedValue": "/var/log/webhcat",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced webhcat-env"
  },
  {
    "id": "puppet var",
    "name": "hcat_pid_dir",
    "displayName": "WebHCat PID Dir",
    "description": "Directory in which the PID files for WebHCat processes will be created",
    "recommendedValue": "/var/run/webhcat",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced webhcat-env"
  },
  {
    "id": "puppet var",
    "name": "hive_database_name",
    "displayName": "hive_database_name",
    "recommendedValue": "",
    "isReconfigurable": false,
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "Advanced hive-env"
  },
  {
    "id": "puppet var",
    "name": "hive_database_type",
    "displayName": "Hive Database Type",
    "recommendedValue": "",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "HIVE",
    "filename": "hive-env.xml",
    "category": "HIVE_METASTORE"
  },
/**********************************************OOZIE***************************************/
  {
    "id": "puppet var",
    "name": "oozieserver_host",
    "displayName": "Oozie Server host",
    "value": "",
    "recommendedValue": "",
    "description": "The hosts that have been assigned to run Oozie Server",
    "displayType": "masterHosts",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "OOZIE_SERVER",
    "index": 0
  },
  // for new MySQL
  {
    "id": "puppet var",
    "name": "oozie_ambari_database",
    "displayName": "Database Type",
    "value": "",
    "recommendedValue": "MySQL",
    "description": "MySQL will be installed by Ambari",
    "displayType": "masterHost",
    "isVisible": false,
    "isReconfigurable": false,
    "isOverridable": false,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "OOZIE_SERVER",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "oozie_database",
    "displayName": "Oozie Database",
    "value": "",
    "recommendedValue": "New Derby Database",
    "options": [
      {
        displayName: 'New Derby Database',
        hidden: false
      },
      {
        displayName: 'Existing MySQL Database',
        hidden: false
      },
      {
        displayName: 'Existing PostgreSQL Database',
        hidden: false
      },
      {
        displayName: 'Existing Oracle Database',
        hidden: false
      },
      {
        displayName: 'Existing SQLA Database',
        hidden: !App.get('isHadoop23Stack')
      }
    ],
    "description": "Current Derby Database will be installed by Ambari",
    "displayType": "radio button",
    "isReconfigurable": true,
    "isOverridable": false,
    "radioName": "oozie-database",
    "isVisible": true,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "OOZIE_SERVER",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "oozie_data_dir",
    "displayName": "Oozie Data Dir",
    "description": "Data directory in which the Oozie DB exists",
    "recommendedValue": "",
    "defaultDirectory": "/hadoop/oozie/data",
    "isReconfigurable": true,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isRequired": false,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "OOZIE_SERVER",
    "index": 9
  },
  {
    "id": "puppet var",
    "name": "oozie_hostname",
    "recommendedValue": "",
    "displayName": "Database Host",
    "description": "The host where the Oozie database is located",
    "isReconfigurable": true,
    "isOverridable": false,
    "displayType": "host",
    "isVisible": true,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "OOZIE_SERVER",
    "index": 3
  },
  {
    "id": "puppet var",
    "name": "oozie_log_dir",
    "displayName": "Oozie Log Dir",
    "description": "Directory for oozie logs",
    "recommendedValue": "/var/log/oozie",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "Advanced oozie-env"
  },
  {
    "id": "puppet var",
    "name": "oozie_pid_dir",
    "displayName": "Oozie PID Dir",
    "description": "Directory in which the pid files for oozie processes will be created",
    "recommendedValue": "/var/run/oozie",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "Advanced oozie-env"
  },
  {
    "id": "puppet var",
    "name": "oozie_admin_port",
    "displayName": "Oozie Server Admin Port",
    "isReconfigurable": true,
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "OOZIE",
    "filename": "oozie-env.xml",
    "category": "Advanced oozie-env"
  },
/**********************************************ZOOKEEPER***************************************/
  {
    "id": "puppet var",
    "name": "zookeeperserver_hosts",
    "displayName": "ZooKeeper Server hosts",
    "value": "",
    "recommendedValue": "",
    "description": "The host that has been assigned to run ZooKeeper Server",
    "displayType": "masterHosts",
    "isVisible": true,
    "isRequiredByAgent": false,
    "isOverridable": false,
    "isRequired": false,
    "serviceName": "ZOOKEEPER",
    "filename": "zookeeper-env.xml",
    "category": "ZOOKEEPER_SERVER",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "dataDir",
    "displayName": "ZooKeeper directory",
    "description": "Data directory for ZooKeeper",
    "recommendedValue": "",
    "defaultDirectory": "/hadoop/zookeeper",
    "isReconfigurable": true,
    "displayType": "directory",
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zoo.cfg.xml",
    "category": "ZOOKEEPER_SERVER",
    "index": 1
  },
  {
    "id": "puppet var",
    "name": "tickTime",
    "displayName": "Length of single Tick",
    "description": "The length of a single tick in milliseconds, which is the basic time unit used by ZooKeeper",
    "recommendedValue": "2000",
    "displayType": "int",
    "unit": "ms",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zoo.cfg.xml",
    "category": "ZOOKEEPER_SERVER",
    "index": 2
  },
  {
    "id": "puppet var",
    "name": "initLimit",
    "displayName": "Ticks to allow for sync at Init",
    "description": "Amount of time, in ticks to allow followers to connect and sync to a leader",
    "recommendedValue": "10",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zoo.cfg.xml",
    "category": "ZOOKEEPER_SERVER",
    "index": 3
  },
  {
    "id": "puppet var",
    "name": "syncLimit",
    "displayName": "Ticks to allow for sync at Runtime",
    "description": "Amount of time, in ticks to allow followers to connect",
    "recommendedValue": "5",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zoo.cfg.xml",
    "category": "ZOOKEEPER_SERVER",
    "index": 4
  },
  {
    "id": "puppet var",
    "name": "clientPort",
    "displayName": "Port for running ZK Server",
    "description": "Port for running ZooKeeper server",
    "recommendedValue": "2181",
    "displayType": "int",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zoo.cfg.xml",
    "category": "ZOOKEEPER_SERVER",
    "index": 5
  },
  {
    "id": "puppet var",
    "name": "zk_log_dir",
    "displayName": "ZooKeeper Log Dir",
    "description": "Directory for ZooKeeper log files",
    "recommendedValue": "/var/log/zookeeper",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zookeeper-env.xml",
    "category": "Advanced zookeeper-env",
    "index": 0
  },
  {
    "id": "puppet var",
    "name": "zk_pid_dir",
    "displayName": "ZooKeeper PID Dir",
    "description": "Directory in which the pid files for zookeeper processes will be created",
    "recommendedValue": "/var/run/zookeeper",
    "isReconfigurable": false,
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "ZOOKEEPER",
    "filename": "zookeeper-env.xml",
    "category": "Advanced zookeeper-env",
    "index": 1
  },
/**********************************************GANGLIA***************************************/
  {
    "id": "puppet var",
    "name": "ganglia_conf_dir",
    "displayName": "Ganglia conf directory",
    "description": "",
    "recommendedValue": "/etc/ganglia/hdp",
    "isReconfigurable": false,
    "displayType": "directory",
    "isVisible": false,
    "isRequiredByAgent": false,
    "serviceName": "GANGLIA",
    "filename": "ganglia-env.xml",
    "category": "Advanced ganglia-env"
  },
/**********************************************FALCON***************************************/
  {
    "id": "puppet var",
    "name": "falconserver_host",
    "displayName": "Falcon Server",
    "description": "The host that has been assigned to run Falcon Server",
    "recommendedValue": "falcon",
    "displayType": "masterHost",
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "FALCON_SERVER"
  },
  {
    "id": "puppet var",
    "name": "falcon_port",
    "displayName": "Falcon server port",
    "description": "Port the Falcon Server listens on",
    "recommendedValue": "15000",
    "isReconfigurable": true,
    "displayType": "int",
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "FALCON_SERVER"
  },
  {
    "id": "puppet var",
    "name": "falcon_local_dir",
    "displayName": "Falcon data directory",
    "description": "Directory where Falcon data, such as activemq data, is stored",
    "recommendedValue": "/hadoop/falcon",
    "isReconfigurable": true,
    "displayType": "directory",
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "FALCON_SERVER"
  },
  {
    "id": "puppet var",
    "name": "falcon_store_uri",
    "displayName": "Falcon store URI",
    "description": "Directory where entity definitions are stored",
    "recommendedValue": "file:///hadoop/falcon/store",
    "isReconfigurable": true,
    "displayType": "string",
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "FALCON_SERVER"
  },
  {
    "id": "puppet var",
    "name": "falcon_log_dir",
    "displayName": "Falcon Log Dir",
    "description": "Directory for Falcon logs",
    "recommendedValue": "/var/log/falcon",
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "isReconfigurable": false,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "Advanced falcon-env"
  },
  {
    "id": "puppet var",
    "name": "falcon_pid_dir",
    "displayName": "Falcon PID Dir",
    "description": "Directory in which the pid files for Falcon processes will be created",
    "recommendedValue": "/var/run/falcon",
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "isReconfigurable": false,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "Advanced falcon-env"
  },
  {
    "id": "puppet var",
    "name": "falcon.embeddedmq",
    "displayName": "falcon.embeddedmq",
    "description": "Whether embeddedmq is enabled or not.",
    "recommendedValue": "true",
    "displayType": "string",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "Advanced falcon-env"
  },
  {
    "id": "puppet var",
    "name": "falcon.embeddedmq.data",
    "displayName": "falcon.embeddedmq.data",
    "description": "Directory in which embeddedmq data is stored.",
    "recommendedValue": "/hadoop/falcon/embeddedmq/data",
    "displayType": "directory",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "Advanced falcon-env"
  },
  {
    "id": "puppet var",
    "name": "falcon.emeddedmq.port",
    "displayName": "falcon.emeddedmq.port",
    "description": "Port that embeddedmq will listen on.",
    "recommendedValue": "61616",
    "displayType": "string",
    "isOverridable": false,
    "isVisible": true,
    "isRequiredByAgent": true,
    "isReconfigurable": true,
    "serviceName": "FALCON",
    "filename": "falcon-env.xml",
    "category": "Advanced falcon-env"
  },
/**********************************************STORM***************************************/
  {
    "id": "puppet var",
    "name": "storm_log_dir",
    "displayName": "storm_log_dir",
    "description": "Storm log directory",
    "recommendedValue": "/var/log/storm",
    "displayType": "directory",
    "isReconfigurable": true,
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "STORM",
    "filename": "storm-env.xml",
    "category": "Advanced storm-env"
  },
  {
    "id": "puppet var",
    "name": "storm_pid_dir",
    "displayName": "storm_pid_dir",
    "description": "Storm PID directory",
    "recommendedValue": "/var/run/storm",
    "displayType": "directory",
    "isReconfigurable": true,
    "isVisible": true,
    "isRequiredByAgent": true,
    "serviceName": "STORM",
    "filename": "storm-env.xml",
    "category": "Advanced storm-env"
  },
  {
    "id": "puppet var",
    "name": "stormuiserver_host",
    "displayName": "Storm UI Server host",
    "description": "The host that has been assigned to run Storm UI Server",
    "recommendedValue": "",
    "displayType": "masterHost",
    "isReconfigurable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "STORM",
    "filename": "storm-env.xml",
    "category": "STORM_UI_SERVER"
  },
  {
    "id": "puppet var",
    "name": "drpcserver_host",
    "displayName": "DRPC Server host",
    "description": "The host that has been assigned to run DRPC Server",
    "recommendedValue": "",
    "displayType": "masterHost",
    "isReconfigurable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "STORM",
    "filename": "storm-env.xml",
    "category": "DRPC_SERVER"
  },
  {
    "id": "puppet var",
    "name": "supervisor_hosts",
    "displayName": "Supervisor hosts",
    "description": "The host that has been assigned to run Supervisor",
    "recommendedValue": "",
    "isRequired": false,
    "displayType": "slaveHosts",
    "isReconfigurable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "STORM",
    "filename": "storm-env.xml",
    "isOverridable": false,
    "category": "SUPERVISOR"
  },
  {
    "id": "puppet var",
    "name": "storm_rest_api_host",
    "displayName": "Storm REST API host",
    "description": "The host that has been assigned to run Storm REST API Server",
    "recommendedValue": "",
    "displayType": "masterHost",
    "isReconfigurable": false,
    "isVisible": true,
    "isRequiredByAgent": false,
    "serviceName": "STORM",
    "filename": "storm-env.xml",
    "isOverridable": false,
    "category": "STORM_REST_API"
  },
/**********************************************MISC***************************************/
  {
    "id": "puppet var",
    "name": "hbase_conf_dir",
    "displayName": "HBase conf dir",
    "description": "",
    "recommendedValue": "/etc/hbase",
    "isRequired": false,
    "displayType": "directory",
    "isVisible": false,
    "isRequiredByAgent": false,
    "serviceName": "MISC",
    "filename": "hbase-env.xml",
    "category": "General",
    "belongsToService": []
  },
  {
    "id": "puppet var",
    "name": "ganglia_runtime_dir",
    "displayName": "Ganglia runtime directory",
    "description": "",
    "recommendedValue": "/var/run/ganglia/hdp",
    "isReconfigurable": false,
    "displayType": "directory",
    "isVisible": false,
    "serviceName": "MISC",
    "filename": "ganglia-env.xml",
    "category": "General",
    "belongsToService": []
  },
  {
    "id": "puppet var",
    "name": "rrdcached_base_dir",
    "displayName": "Ganglia rrdcached base directory",
    "description": "Default directory for saving the rrd files on ganglia server",
    "recommendedValue": "/var/lib/ganglia/rrds",
    "displayType": "directory",
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "GANGLIA",
    "filename": "ganglia-env.xml",
    "category": "General",
    "belongsToService": ["GANGLIA"]
  },
  {
    "id": "puppet var",
    "name": "ignore_groupsusers_create",
    "displayName": "Skip group modifications during install",
    "displayType": "checkbox",
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "filename": "cluster-env.xml",
    "category": "Users and Groups"
  },
  {
    "id": "puppet var",
    "name": "override_uid",
    "displayName": "Have Ambari manage UIDs",
    "displayType": "checkbox",
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "filename": "cluster-env.xml",
    "category": "Users and Groups"
  },
  {
    "id": "puppet var",
    "name": "create_notification",
    "displayName": "Create Notification",
    "isRequired": true,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "MISC",
    "category": "Notifications",
    "recommendedValue": "no",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "mail.smtp.host",
    "displayName": "SMTP Host",
    "displayType": "host",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "mail.smtp.port",
    "displayName": "SMTP Port",
    "displayType": "int",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "mail.smtp.from",
    "displayName": "FROM Email Address",
    "displayType": "email",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "ambari.dispatch.recipients",
    "displayName": " TO Email Address",
    "displayType": "email",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "smtp_use_auth",
    "displayName": "SMTP server requires authentication",
    "displayType": "checkbox",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "recommendedValue": true,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "ambari.dispatch.credential.username",
    "displayName": "SMTP Username",
    "displayType": "string",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-2",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "ambari.dispatch.credential.password",
    "displayName": "SMTP Password",
    "displayType": "string",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": true,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-2",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "mail.smtp.starttls.enable",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
  {
    "id": "puppet var",
    "name": "mail.smtp.startssl.enable",
    "isRequired": false,
    "isReconfigurable": true,
    "isOverridable": false,
    "isVisible": false,
    "serviceName": "MISC",
    "category": "Notifications",
    "rowStyleClass": "indent-1",
    "filename": "alert_notification"
  },
/************************************************AMBARI_METRICS******************************************/
  {
    "id": "site property",
    "name": "timeline.metrics.service.operation.mode",
    "displayName": "Metrics Service operation mode",
    "description": "\n      Service Operation modes:\n      1) embedded: Metrics stored on local FS, HBase in Standalone mode\n      2) distributed: HBase daemons writing to HDFS\n      3) external: External HBase storage backend\n    ",
    "recommendedValue": "embedded",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "General",
    "index": 1
  },
  {
    "id": "site property",
    "name": "metrics_collector_log_dir",
    "displayName": "Metrics Collector log dir",
    "description": "\n      Log location for collector logs\n    ",
    "recommendedValue": "embedded",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-env.xml",
    "category": "General",
    "index": 2
  },
  {
    "id": "site property",
    "name": "metrics_collector_pid_dir",
    "displayName": "Metrics Collector pid dir",
    "description": "\n      pid location for collector\n    ",
    "recommendedValue": "embedded",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-env.xml",
    "category": "General",
    "index": 3
  },
  {
    "id": "site property",
    "name": "metrics_monitor_log_dir",
    "displayName": "Metrics Monitor log dir",
    "description": "\n      Log location for monitor logs\n    ",
    "recommendedValue": "embedded",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-env.xml",
    "category": "General",
    "index": 4
  },
  {
    "id": "site property",
    "name": "metrics_monitor_pid_dir",
    "displayName": "Metrics Monitor pid dir",
    "description": "\n      pid location for monitor\n    ",
    "recommendedValue": "embedded",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-env.xml",
    "category": "General",
    "index": 5
  },
  {
    "id": "site property",
    "name": "timeline.metrics.aggregator.checkpoint.dir",
    "displayName": "Aggregator checkpoint directory",
    "description": "\n      Directory to store aggregator checkpoints\n    ",
    "recommendedValue": "/tmp",
    "displayType": "directory",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 17
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.hourly.checkpointCutOffMultiplier",
    "displayName": "Hourly cluster aggregator checkpoint cutOff multiplier",
    "description": "\n      Multiplier value * interval = Max allowed checkpoint lag. Effectively\n      if aggregator checkpoint is greater than max allowed checkpoint delay,\n      the checkpoint will be discarded by the aggregator.\n    ",
    "recommendedValue": "2",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 16
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.hourly.disabled",
    "displayName": "Disable Hourly cluster aggregator",
    "description": "\n      Disable cluster based hourly aggregations.\n    ",
    "recommendedValue": "false",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 14
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.hourly.interval",
    "displayName": "Hourly cluster aggregator Interval",
    "description": "\n      Time in seconds to sleep for the hourly resolution cluster wide\n      aggregator. Default is 1 hour.\n    ",
    "recommendedValue": "3600",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 15
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.minute.checkpointCutOffMultiplier",
    "displayName": "Minute cluster aggregator checkpoint cutOff multiplier",
    "description": "\n      Multiplier value * interval = Max allowed checkpoint lag. Effectively\n      if aggregator checkpoint is greater than max allowed checkpoint delay,\n      the checkpoint will be discarded by the aggregator.\n    ",
    "recommendedValue": "2",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 13
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.minute.disabled",
    "displayName": "Disable minute cluster aggregator",
    "description": "\n      Disable cluster based minute aggregations.\n    ",
    "recommendedValue": "false",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 10
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.minute.interval",
    "displayName": "Minute cluster aggregator interval",
    "description": "\n      Time in seconds to sleep for the minute resolution cluster wide\n      aggregator. Default resolution is 2 minutes.\n    ",
    "recommendedValue": "120",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 11
  },
  {
    "id": "site property",
    "name": "timeline.metrics.cluster.aggregator.minute.timeslice.interval",
    "displayName": "Minute cluster aggregator timeslice interval",
    "description": "\n      Lowest resolution of desired data for cluster level minute aggregates.\n    ",
    "recommendedValue": "15",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 12
  },
  {
    "id": "site property",
    "name": "timeline.metrics.host.aggregator.hourly.checkpointCutOffMultiplier",
    "displayName": "Hourly host aggregator checkpoint cutOff multiplier",
    "description": "\n      Multiplier value * interval = Max allowed checkpoint lag. Effectively\n      if aggregator checkpoint is greater than max allowed checkpoint delay,\n      the checkpoint will be discarded by the aggregator.\n    ",
    "recommendedValue": "2",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 9
  },
  {
    "id": "site property",
    "name": "timeline.metrics.host.aggregator.hourly.disabled",
    "displayName": "Disable Hourly host aggregator",
    "description": "\n      Disable host based hourly aggregations\n    ",
    "recommendedValue": "false",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 7
  },
  {
    "id": "site property",
    "name": "timeline.metrics.host.aggregator.hourly.interval",
    "displayName": "Hourly host aggregator interval",
    "description": "\n      Time in seconds to sleep for the hourly resolution host based\n      aggregator. Default resolution is 1 hour.\n    ",
    "recommendedValue": "3600",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 8
  },
  {
    "id": "site property",
    "name": "timeline.metrics.host.aggregator.minute.checkpointCutOffMultiplier",
    "displayName": "Minute host aggregator checkpoint cutOff multiplier",
    "description": "\n      Multiplier value * interval = Max allowed checkpoint lag. Effectively\n      if aggregator checkpoint is greater than max allowed checkpoint delay,\n      the checkpoint will be discarded by the aggregator.\n    ",
    "recommendedValue": "2",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 6
  },
  {
    "id": "site property",
    "name": "timeline.metrics.host.aggregator.minute.disabled",
    "displayName": "Disable Minute host aggregator",
    "description": "\n      Disable host based minute aggregations.\n    ",
    "recommendedValue": "false",
    "displayType": "string",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 4
  },
  {
    "id": "site property",
    "name": "timeline.metrics.host.aggregator.minute.interval",
    "displayName": "Minute host aggregator interval",
    "description": "\n      Time in seconds to sleep for the minute resolution host based\n      aggregator. Default resolution is 5 minutes.\n    ",
    "recommendedValue": "300",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 5
  },
  {
    "id": "site property",
    "name": "timeline.metrics.service.checkpointDelay",
    "displayName": "Metrics service checkpoint delay",
    "description": "\n      Time in seconds to sleep on the first run or when the checkpoint is\n      too old.\n    ",
    "recommendedValue": "120",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 1
  },
  {
    "id": "site property",
    "name": "timeline.metrics.service.default.result.limit",
    "displayName": "Metrics service default result limit",
    "description": "\n      Max result limit on number of rows returned. Calculated as follows:\n      4 aggregate metrics/min * 60 * 24: Retrieve aggregate data for 1 day.\n    ",
    "recommendedValue": "5760",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 2
  },
  {
    "id": "site property",
    "name": "timeline.metrics.service.resultset.fetchSize",
    "displayName": "Metrics service resultset fetchSize",
    "description": "\n      JDBC resultset prefect size for aggregator queries.\n    ",
    "recommendedValue": "2000",
    "displayType": "int",
    "serviceName": "AMBARI_METRICS",
    "filename": "ams-site.xml",
    "category": "MetricCollector",
    "index": 3
  },
  {
    "id": "site property",
    "name": "ams.zookeeper.keytab",
    "displayName": "ams.zookeeper.keytab",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "ams.zookeeper.principal",
    "displayName": "ams.zookeeper.principal",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hadoop.security.authentication",
    "displayName": "hadoop.security.authentication",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.coprocessor.master.classes",
    "displayName": "hbase.coprocessor.master.classes",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.coprocessor.region.classes",
    "displayName": "hbase.coprocessor.region.classes",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.master.kerberos.principal",
    "displayName": "hbase.master.kerberos.principal",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.master.keytab.file",
    "displayName": "hbase.master.keytab.file",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.myclient.keytab",
    "displayName": "hbase.myclient.keytab",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.myclient.principal",
    "displayName": "hbase.myclient.principal",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.regionserver.kerberos.principal",
    "displayName": "hbase.regionserver.kerberos.principal",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.regionserver.keytab.file",
    "displayName": "hbase.regionserver.keytab.file",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.security.authentication",
    "displayName": "hbase.security.authentication",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.security.authorization",
    "displayName": "hbase.security.authorization",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.zookeeper.property.authProvider.1",
    "displayName": "hbase.zookeeper.property.authProvider.1",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.zookeeper.property.jaasLoginRenew",
    "displayName": "hbase.zookeeper.property.jaasLoginRenew",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.zookeeper.property.kerberos.removeHostFromPrincipal",
    "displayName": "hbase.zookeeper.property.kerberos.removeHostFromPrincipal",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "hbase.zookeeper.property.kerberos.removeRealmFromPrincipal",
    "displayName": "hbase.zookeeper.property.kerberos.removeRealmFromPrincipal",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
  {
    "id": "site property",
    "name": "zookeeper.znode.parent",
    "displayName": "zookeeper.znode.parent",
    "isRequired": false,
    "serviceName": "AMBARI_METRICS",
    "category": "Advanced ams-hbase-security-site",
    "filename": "ams-hbase-security-site.xml"
  },
/************************************************Kerberos Descriptor******************************************/
  {
    "name": "smokeuser_principal_name",
    "displayName": "Smoke user principal",
    "category": "Ambari Principals",
    "filename": "cluster-env.xml",
    "index": 1
  },
  {
    "name": "smokeuser_keytab",
    "displayName": "Smoke user keytab",
    "category": "Ambari Principals",
    "filename": "cluster-env.xml",
    "index": 2
  },
  {
    "name": "hdfs_principal_name",
    "displayName": "HDFS user principal",
    "category": "Ambari Principals",
    "filename": "hadoop-env.xml",
    "index": 3
  },
  {
    "name": "hdfs_user_keytab",
    "displayName": "HDFS user keytab",
    "category": "Ambari Principals",
    "filename": "hadoop-env.xml",
    "index": 4
  },
  {
    "name": "hbase_principal_name",
    "displayName": "HBase user principal",
    "category": "Ambari Principals",
    "filename": "hbase-env.xml",
    "index": 5
  },
  {
    "name": "hbase_user_keytab",
    "displayName": "HBase user keytab",
    "category": "Ambari Principals",
    "filename": "hbase-env.xml",
    "index": 6
  },
  {
    "name": "accumulo_principal_name",
    "displayName": "Accumulo user principal",
    "category": "Ambari Principals",
    "filename": "accumulo-env.xml",
    "index": 7
  },
  {
    "name": "accumulo_user_keytab",
    "displayName": "Accumulo user keytab",
    "category": "Ambari Principals",
    "filename": "accumulo-env.xml",
    "index": 8
  },
  {
    "name": "spark.history.kerberos.principal",
    "displayName": "Spark user principal",
    "category": "Ambari Principals",
    "filename": "spark-env.xml",
    "index": 9
  },
  {
    "name": "spark.history.kerberos.keytab",
    "displayName": "Spark user keytab",
    "category": "Ambari Principals",
    "filename": "spark-env.xml",
    "index": 10
  },
  {
    "name": "storm_principal_name",
    "displayName": "Storm user principal",
    "category": "Ambari Principals",
    "filename": "storm-env.xml",
    "index": 11
  },
  {
    "name": "storm_keytab",
    "displayName": "Storm user keytab",
    "category": "Ambari Principals",
    "filename": "storm-env.xml",
    "index": 12
  }
];

if (App.get('isHadoopWindowsStack')) {
  var excludedWindowsConfigs = [
    'dfs.client.read.shortcircuit',
    'knox_pid_dir',
    'ignore_groupsusers_create',
    'hive_database',
    'oozie_database',
    'override_hbase_uid'
  ];

  hdp2properties = hdp2properties.filter(function (item) {
    return !excludedWindowsConfigs.contains(item.name);
  });

  hdp2properties.push(
    {
      "id": "puppet var",
      "name": "hadoop.user.name",
      "displayName": "Hadoop User Name",
      "description": "User to run Hadoop services under",
      "recommendedValue": "hadoop",
      "isReconfigurable": false,
      "displayType": "user",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "MISC",
      "filename": "cluster-env.xml",
      "category": "Users and Groups",
      "belongsToService": ["HDFS"],
      "index": 0
    },
    {
      "id": "puppet var",
      "name": "hadoop.user.password",
      "displayName": "Hadoop User Password",
      "description": "Password for hadoop user",
      "isReconfigurable": false,
      "displayType": "password",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "MISC",
      "filename": "cluster-env.xml",
      "category": "Users and Groups",
      "belongsToService": ["HDFS"],
      "index": 1
    },
    {
      "id": "puppet var",
      "name": "hive_database",
      "displayName": "Hive Database",
      "value": "",
      "recommendedValue": "Existing MSSQL Server database with SQL authentication",
      "options": [
        {
          displayName: 'Existing MSSQL Server database with SQL authentication',
          foreignKeys: ['hive_existing_mssql_server_database', 'hive_existing_mssql_server_host'],
          hidden: false
        },
        {
          displayName: 'Existing MSSQL Server database with integrated authentication',
          foreignKeys: ['hive_existing_mssql_server_2_database', 'hive_existing_mssql_server_2_host'],
          hidden: false
        }
      ],
      "description": "",
      "displayType": "radio button",
      "isReconfigurable": true,
      "radioName": "hive-database",
      "isOverridable": false,
      "isVisible": true,
      "serviceName": "HIVE",
      "filename": "hive-env.xml",
      "category": "HIVE_METASTORE",
      "index": 2
    },
    {
      "id": "puppet var",
      "name": "oozie_database",
      "displayName": "Oozie Database",
      "value": "",
      "recommendedValue": "Existing MSSQL Server database with SQL authentication",
      "options": [
        {
          displayName: 'Existing MSSQL Server database with SQL authentication',
          foreignKeys: ['oozie_existing_mssql_server_database', 'oozie_existing_mssql_server_host'],
          hidden: false
        },
        {
          displayName: 'Existing MSSQL Server database with integrated authentication',
          foreignKeys: ['oozie_existing_mssql_server_2_database', 'oozie_existing_mssql_server_2_host'],
          hidden: false
        }
      ],
      "description": "",
      "displayType": "radio button",
      "isReconfigurable": true,
      "isOverridable": false,
      "radioName": "oozie-database",
      "isVisible": true,
      "serviceName": "OOZIE",
      "filename": "oozie-env.xml",
      "category": "OOZIE_SERVER",
      "index": 2
    }
  );
}

var atsProperties = [
  {
    "id": "site property",
    "name": "yarn.timeline-service.enabled",
    "displayName": "yarn.timeline-service.enabled",
    "category": "APP_TIMELINE_SERVER",
    "displayType": "checkbox",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.leveldb-timeline-store.path",
    "displayName": "yarn.timeline-service.leveldb-timeline-store.path",
    "defaultDirectory": "/hadoop/yarn/timeline",
    "category": "APP_TIMELINE_SERVER",
    "displayType": "directory",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.leveldb-timeline-store.ttl-interval-ms",
    "displayName": "yarn.timeline-service.leveldb-timeline-store.ttl-interval-ms",
    "displayType": "int",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.store-class",
    "displayName": "yarn.timeline-service.store-class",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.ttl-enable",
    "displayName": "yarn.timeline-service.ttl-enable",
    "displayType": "checkbox",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.ttl-ms",
    "displayName": "yarn.timeline-service.ttl-ms",
    "displayType": "int",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.generic-application-history.store-class",
    "displayName": "yarn.timeline-service.generic-application-history.store-class",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.webapp.address",
    "displayName": "yarn.timeline-service.webapp.address",
    "displayType": "string",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.webapp.https.address",
    "displayName": "yarn.timeline-service.webapp.https.address",
    "displayType": "string",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  },
  {
    "id": "site property",
    "name": "yarn.timeline-service.address",
    "displayName": "yarn.timeline-service.address",
    "displayType": "string",
    "category": "APP_TIMELINE_SERVER",
    "serviceName": "YARN",
    "filename": "yarn-site.xml"
  }
];

if (!App.get('isHadoop20Stack')) {
  hdp2properties.pushObjects(atsProperties);
}

module.exports =
{
  "configProperties": hdp2properties
};
