#!/usr/bin/env ambari-python-wrap
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

import math

class HDPWIN22StackAdvisor(HDPWIN21StackAdvisor):

  def getServiceConfigurationRecommenderDict(self):
    parentRecommendConfDict = super(HDPWIN22StackAdvisor, self).getServiceConfigurationRecommenderDict()
    childRecommendConfDict = {
      "HDFS": self.recommendHDFSConfigurations,
      "HIVE": self.recommendHIVEConfigurations,
      "HBASE": self.recommendHBASEConfigurations,
      "MAPREDUCE2": self.recommendMapReduce2Configurations,
      "TEZ": self.recommendTezConfigurations,
      "YARN": self.recommendYARNConfigurations,
      "AMBARI_METRICS": self.recommendAmsConfigurations
    }
    parentRecommendConfDict.update(childRecommendConfDict)
    return parentRecommendConfDict

  def recommendHDFSConfigurations(self, configurations, clusterData, services, hosts):
    putHdfsSiteProperty = self.putProperty(configurations, "hdfs-site", services)
    putHdfsSiteProperty("dfs.datanode.max.transfer.threads", 16384 if clusterData["hBaseInstalled"] else 4096)
    dataDirsCount = 1
    if "dfs.datanode.data.dir" in configurations["hdfs-site"]["properties"]:
      dataDirsCount = len(str(configurations["hdfs-site"]["properties"]["dfs.datanode.data.dir"]).split(","))
    if dataDirsCount <= 2:
      failedVolumesTolerated = 0
    elif dataDirsCount <= 4:
      failedVolumesTolerated = 1
    else:
      failedVolumesTolerated = 2
    putHdfsSiteProperty("dfs.datanode.failed.volumes.tolerated", failedVolumesTolerated)

    namenodeHosts = self.getHostsWithComponent("HDFS", "NAMENODE", services, hosts)

    # 25 * # of cores on NameNode
    nameNodeCores = 4
    if namenodeHosts is not None and len(namenodeHosts):
      nameNodeCores = int(namenodeHosts[0]['Hosts']['cpu_count'])
    putHdfsSiteProperty("dfs.namenode.handler.count", 25*nameNodeCores)

    putHdfsSiteProperty("dfs.namenode.safemode.threshold-pct", "0.99f" if len(namenodeHosts) > 1 else "1.0f")

    putHdfsEnvProperty = self.putProperty(configurations, "hadoop-env", services)
    putHdfsEnvPropertyAttribute = self.putPropertyAttribute(configurations, "hadoop-env")

    putHdfsEnvProperty('namenode_heapsize', max(int(clusterData['totalAvailableRam'] / 2), 1024))
    putHdfsEnvProperty('namenode_opt_newsize', max(int(clusterData['totalAvailableRam'] / 8), 128))
    putHdfsEnvProperty('namenode_opt_maxnewsize', max(int(clusterData['totalAvailableRam'] / 8), 256))

    nn_max_heapsize=None
    if (namenodeHosts is not None and len(namenodeHosts) > 0):
      if len(namenodeHosts) > 1:
        nn_max_heapsize = min(int(namenodeHosts[0]["Hosts"]["total_mem"]), int(namenodeHosts[1]["Hosts"]["total_mem"])) / 1024
      else:
        nn_max_heapsize = int(namenodeHosts[0]["Hosts"]["total_mem"] / 1024) # total_mem in kb

      putHdfsEnvPropertyAttribute('namenode_heapsize', 'maximum', max(nn_max_heapsize, 1024))

      nn_heapsize = nn_max_heapsize
      nn_heapsize -= clusterData["reservedRam"]
      if clusterData["hBaseInstalled"]:
        nn_heapsize -= clusterData["hbaseRam"]
      putHdfsEnvProperty('namenode_heapsize', max(int(nn_heapsize / 2), 1024))
      putHdfsEnvProperty('namenode_opt_newsize', max(int(nn_heapsize / 8), 128))
      putHdfsEnvProperty('namenode_opt_maxnewsize', max(int(nn_heapsize / 8), 256))

    datanodeHosts = self.getHostsWithComponent("HDFS", "DATANODE", services, hosts)
    if datanodeHosts is not None and len(datanodeHosts) > 0:
      min_datanode_ram_kb = 1073741824 # 1 TB
      for datanode in datanodeHosts:
        ram_kb = datanode['Hosts']['total_mem']
        min_datanode_ram_kb = min(min_datanode_ram_kb, ram_kb)

      datanodeFilesM = len(datanodeHosts)*dataDirsCount/10 # in millions, # of files = # of disks * 100'000
      nn_memory_configs = [
        {'nn_heap':1024,  'nn_opt':128},
        {'nn_heap':3072,  'nn_opt':512},
        {'nn_heap':5376,  'nn_opt':768},
        {'nn_heap':9984,  'nn_opt':1280},
        {'nn_heap':14848, 'nn_opt':2048},
        {'nn_heap':19456, 'nn_opt':2560},
        {'nn_heap':24320, 'nn_opt':3072},
        {'nn_heap':33536, 'nn_opt':4352},
        {'nn_heap':47872, 'nn_opt':6144},
        {'nn_heap':59648, 'nn_opt':7680},
        {'nn_heap':71424, 'nn_opt':8960},
        {'nn_heap':94976, 'nn_opt':8960}
      ]
      index = {
        datanodeFilesM < 1 : 0,
        1 <= datanodeFilesM < 5 : 1,
        5 <= datanodeFilesM < 10 : 2,
        10 <= datanodeFilesM < 20 : 3,
        20 <= datanodeFilesM < 30 : 4,
        30 <= datanodeFilesM < 40 : 5,
        40 <= datanodeFilesM < 50 : 6,
        50 <= datanodeFilesM < 70 : 7,
        70 <= datanodeFilesM < 100 : 8,
        100 <= datanodeFilesM < 125 : 9,
        125 <= datanodeFilesM < 150 : 10,
        150 <= datanodeFilesM : 11
      }[1]

      nn_memory_config = nn_memory_configs[index]

      #override with new values if applicable
      if nn_max_heapsize is not None and nn_memory_config['nn_heap'] <= nn_max_heapsize:
        putHdfsEnvProperty('namenode_heapsize', nn_memory_config['nn_heap'])
        putHdfsEnvProperty('namenode_opt_newsize', nn_memory_config['nn_opt'])
        putHdfsEnvProperty('namenode_opt_maxnewsize', nn_memory_config['nn_opt'])

      putHdfsEnvPropertyAttribute('dtnode_heapsize', 'maximum', int(min_datanode_ram_kb/1024))

    putHdfsSitePropertyAttribute = self.putPropertyAttribute(configurations, "hdfs-site")
    putHdfsSitePropertyAttribute('dfs.datanode.failed.volumes.tolerated', 'maximum', dataDirsCount)

  def recommendYARNConfigurations(self, configurations, clusterData, services, hosts):
    super(HDPWIN22StackAdvisor, self).recommendYARNConfigurations(configurations, clusterData, services, hosts)
    putYarnProperty = self.putProperty(configurations, "yarn-site", services)
    putYarnProperty('yarn.nodemanager.resource.cpu-vcores', clusterData['cpu'])
    putYarnProperty('yarn.scheduler.minimum-allocation-vcores', 1)
    putYarnProperty('yarn.scheduler.maximum-allocation-vcores', configurations["yarn-site"]["properties"]["yarn.nodemanager.resource.cpu-vcores"])
    # Property Attributes
    putYarnPropertyAttribute = self.putPropertyAttribute(configurations, "yarn-site")
    nodeManagerHost = self.getHostWithComponent("YARN", "NODEMANAGER", services, hosts)
    if (nodeManagerHost is not None):
      putYarnProperty('yarn.nodemanager.resource.cpu-vcores', nodeManagerHost["Hosts"]["cpu_count"] * 2)
      putYarnPropertyAttribute('yarn.nodemanager.resource.memory-mb', 'maximum', int(nodeManagerHost["Hosts"]["total_mem"] / 1024)) # total_mem in kb
      putYarnPropertyAttribute('yarn.nodemanager.resource.cpu-vcores', 'maximum', nodeManagerHost["Hosts"]["cpu_count"] * 4)
      putYarnPropertyAttribute('yarn.scheduler.minimum-allocation-vcores', 'maximum', configurations["yarn-site"]["properties"]["yarn.nodemanager.resource.cpu-vcores"])
      putYarnPropertyAttribute('yarn.scheduler.maximum-allocation-vcores', 'maximum', configurations["yarn-site"]["properties"]["yarn.nodemanager.resource.cpu-vcores"])
      putYarnPropertyAttribute('yarn.scheduler.minimum-allocation-mb', 'maximum', configurations["yarn-site"]["properties"]["yarn.nodemanager.resource.memory-mb"])
      putYarnPropertyAttribute('yarn.scheduler.maximum-allocation-mb', 'maximum', configurations["yarn-site"]["properties"]["yarn.nodemanager.resource.memory-mb"])

      if "yarn-env" in services["configurations"] and "yarn_cgroups_enabled" in services["configurations"]["yarn-env"]["properties"]:
        yarn_cgroups_enabled = services["configurations"]["yarn-env"]["properties"]["yarn_cgroups_enabled"].lower() == "true"
        if yarn_cgroups_enabled:
          putYarnProperty('yarn.nodemanager.container-executor.class', 'org.apache.hadoop.yarn.server.nodemanager.LinuxContainerExecutor')
          putYarnProperty('yarn.nodemanager.container-executor.group', 'hadoop')
          putYarnProperty('yarn.nodemanager.container-executor.resources-handler.class', 'org.apache.hadoop.yarn.server.nodemanager.util.CgroupsLCEResourcesHandler')
          putYarnProperty('yarn.nodemanager.container-executor.cgroups.hierarchy', ' /yarn')
          putYarnProperty('yarn.nodemanager.container-executor.cgroups.mount', 'true')
          putYarnProperty('yarn.nodemanager.linux-container-executor.cgroups.mount-path', '/cgroup')
        else:
          putYarnProperty('yarn.nodemanager.container-executor.class', 'org.apache.hadoop.yarn.server.nodemanager.DefaultContainerExecutor')
          putYarnPropertyAttribute('yarn.nodemanager.container-executor.resources-handler.class', 'delete', 'true')
          putYarnPropertyAttribute('yarn.nodemanager.container-executor.cgroups.hierarchy', 'delete', 'true')
          putYarnPropertyAttribute('yarn.nodemanager.container-executor.cgroups.mount', 'delete', 'true')
          putYarnPropertyAttribute('yarn.nodemanager.linux-container-executor.cgroups.mount-path', 'delete', 'true')

  def recommendMapReduce2Configurations(self, configurations, clusterData, services, hosts):
    self.recommendYARNConfigurations(configurations, clusterData, services, hosts)
    putMapredProperty = self.putProperty(configurations, "mapred-site", services)
    putMapredProperty('yarn.app.mapreduce.am.resource.mb', configurations["yarn-site"]["properties"]["yarn.scheduler.minimum-allocation-mb"])
    putMapredProperty('yarn.app.mapreduce.am.command-opts', "-Xmx" + str(int(0.8 * int(configurations["mapred-site"]["properties"]["yarn.app.mapreduce.am.resource.mb"]))) + "m" + " -Dhdp.version=${hdp.version}")
    putMapredProperty('mapreduce.map.memory.mb', int(configurations["yarn-site"]["properties"]["yarn.scheduler.minimum-allocation-mb"]))
    putMapredProperty('mapreduce.reduce.memory.mb', int(2*int(configurations["yarn-site"]["properties"]["yarn.scheduler.minimum-allocation-mb"])))
    putMapredProperty('mapreduce.map.java.opts', "-Xmx" + str(int(0.8*int(configurations["mapred-site"]["properties"]["mapreduce.map.memory.mb"]))) + "m")
    putMapredProperty('mapreduce.reduce.java.opts', "-Xmx" + str(int(0.8*int(configurations["mapred-site"]["properties"]["mapreduce.reduce.memory.mb"]))) + "m")
    putMapredProperty('mapreduce.task.io.sort.mb', str(int(0.7*int(configurations["mapred-site"]["properties"]["mapreduce.map.memory.mb"]))))
    # Property Attributes
    putMapredPropertyAttribute = self.putPropertyAttribute(configurations, "mapred-site")
    yarnMinAllocationSize = int(configurations["yarn-site"]["properties"]["yarn.scheduler.minimum-allocation-mb"])
    yarnMaxAllocationSize = min(30 * int(configurations["yarn-site"]["properties"]["yarn.scheduler.minimum-allocation-mb"]), int(configurations["yarn-site"]["properties"]["yarn.scheduler.maximum-allocation-mb"]))
    putMapredPropertyAttribute("mapreduce.map.memory.mb", "maximum", yarnMaxAllocationSize)
    putMapredPropertyAttribute("mapreduce.map.memory.mb", "minimum", yarnMinAllocationSize)
    putMapredPropertyAttribute("mapreduce.reduce.memory.mb", "maximum", yarnMaxAllocationSize)
    putMapredPropertyAttribute("mapreduce.reduce.memory.mb", "minimum", yarnMinAllocationSize)
    putMapredPropertyAttribute("yarn.app.mapreduce.am.resource.mb", "maximum", yarnMaxAllocationSize)
    putMapredPropertyAttribute("yarn.app.mapreduce.am.resource.mb", "minimum", yarnMinAllocationSize)

  def recommendHIVEConfigurations(self, configurations, clusterData, services, hosts):
    super(HDPWIN22StackAdvisor, self).recommendHiveConfigurations(configurations, clusterData, services, hosts)

    putHiveServerProperty = self.putProperty(configurations, "hiveserver2-site", services)
    putHiveEnvProperty = self.putProperty(configurations, "hive-env", services)
    putHiveSiteProperty = self.putProperty(configurations, "hive-site", services)

    servicesList = [service["StackServices"]["service_name"] for service in services["services"]]

    putHiveSiteProperty('datanucleus.autoCreateSchema', 'false')

    #  Storage
    putHiveEnvProperty("hive_exec_orc_storage_strategy", "SPEED")
    putHiveSiteProperty("hive.exec.orc.encoding.strategy", configurations["hive-env"]["properties"]["hive_exec_orc_storage_strategy"])
    putHiveSiteProperty("hive.exec.orc.compression.strategy", configurations["hive-env"]["properties"]["hive_exec_orc_storage_strategy"])

    putHiveSiteProperty("hive.exec.orc.default.stripe.size", "67108864")
    putHiveSiteProperty("hive.exec.orc.default.compress", "ZLIB")
    putHiveSiteProperty("hive.optimize.index.filter", "true")
    putHiveSiteProperty("hive.optimize.sort.dynamic.partition", "false")

    # Vectorization
    putHiveSiteProperty("hive.vectorized.execution.enabled", "true")
    putHiveSiteProperty("hive.vectorized.execution.reduce.enabled", "false")

    # Memory
    putHiveSiteProperty("hive.auto.convert.join.noconditionaltask.size", "2147483648")
    putHiveSiteProperty("hive.exec.reducers.bytes.per.reducer", "67108864")

    # Transactions
    putHiveEnvProperty("hive_txn_acid", "off")
    if str(configurations["hive-env"]["properties"]["hive_txn_acid"]).lower() == "on":
      putHiveSiteProperty("hive.txn.manager", "org.apache.hadoop.hive.ql.lockmgr.DbTxnManager")
      putHiveSiteProperty("hive.support.concurrency", "true")
      putHiveSiteProperty("hive.compactor.initiator.on", "true")
      putHiveSiteProperty("hive.compactor.worker.threads", "1")
      putHiveSiteProperty("hive.enforce.bucketing", "true")
      putHiveSiteProperty("hive.exec.dynamic.partition.mode", "nonstrict")
    else:
      putHiveSiteProperty("hive.txn.manager", "org.apache.hadoop.hive.ql.lockmgr.DummyTxnManager")
      putHiveSiteProperty("hive.support.concurrency", "false")
      putHiveSiteProperty("hive.compactor.initiator.on", "false")
      putHiveSiteProperty("hive.compactor.worker.threads", "0")
      putHiveSiteProperty("hive.enforce.bucketing", "false")
      putHiveSiteProperty("hive.exec.dynamic.partition.mode", "strict")

    # ATS
    putHiveEnvProperty("hive_timeline_logging_enabled", "true")

    hooks_properties = ["hive.exec.pre.hooks", "hive.exec.post.hooks", "hive.exec.failure.hooks"]
    include_ats_hook = str(configurations["hive-env"]["properties"]["hive_timeline_logging_enabled"]).lower() == "true"

    ats_hook_class = "org.apache.hadoop.hive.ql.hooks.ATSHook"
    for hooks_property in hooks_properties:
      if hooks_property in configurations["hive-site"]["properties"]:
        hooks_value = configurations["hive-site"]["properties"][hooks_property]
      else:
        hooks_value = " "
      if include_ats_hook and ats_hook_class not in hooks_value:
        if hooks_value == " ":
          hooks_value = ats_hook_class
        else:
          hooks_value = hooks_value + "," + ats_hook_class
      if not include_ats_hook and ats_hook_class in hooks_value:
        hooks_classes = []
        for hook_class in hooks_value.split(","):
          if hook_class != ats_hook_class and hook_class != " ":
            hooks_classes.append(hook_class)
        if hooks_classes:
          hooks_value = ",".join(hooks_classes)
        else:
          hooks_value = " "

      putHiveSiteProperty(hooks_property, hooks_value)

    # Tez Engine
    if "TEZ" in servicesList:
      putHiveSiteProperty("hive.execution.engine", "tez")
    else:
      putHiveSiteProperty("hive.execution.engine", "mr")

    container_size = "512"

    if not "yarn-site" in configurations:
      self.recommendYARNConfigurations(configurations, clusterData, services, hosts)

    if "yarn-site" in configurations and \
                    "yarn.scheduler.minimum-allocation-mb" in configurations["yarn-site"]["properties"]:
      container_size = configurations["yarn-site"]["properties"]["yarn.scheduler.minimum-allocation-mb"]
    putHiveSiteProperty("hive.tez.container.size", container_size)
    putHiveSiteProperty("hive.prewarm.enabled", "false")
    putHiveSiteProperty("hive.prewarm.numcontainers", "3")
    putHiveSiteProperty("hive.tez.auto.reducer.parallelism", "true")
    putHiveSiteProperty("hive.tez.dynamic.partition.pruning", "true")

    # CBO
    putHiveEnvProperty("cost_based_optimizer", "On")
    if str(configurations["hive-env"]["properties"]["cost_based_optimizer"]).lower() == "on":
      putHiveSiteProperty("hive.cbo.enable", "true")
      putHiveSiteProperty("hive.stats.fetch.partition.stats", "true")
      putHiveSiteProperty("hive.stats.fetch.column.stats", "true")
    else:
      putHiveSiteProperty("hive.cbo.enable", "false")
      putHiveSiteProperty("hive.stats.fetch.partition.stats", "false")
      putHiveSiteProperty("hive.stats.fetch.column.stats", "false")
    putHiveSiteProperty("hive.compute.query.using.stats ", "true")

    # Interactive Query
    putHiveServerProperty("hive.server2.tez.initialize.default.sessions", "false")
    putHiveServerProperty("hive.server2.tez.sessions.per.default.queue", "1")
    putHiveServerProperty("hive.server2.enable.doAs", "true")
    putHiveServerProperty("tez.session.am.dag.submit.timeout.secs", "600")

    yarn_queues = "default"
    if "capacity-scheduler" in configurations and \
                    "yarn.scheduler.capacity.root.queues" in configurations["capacity-scheduler"]["properties"]:
      yarn_queues = str(configurations["capacity-scheduler"]["properties"]["yarn.scheduler.capacity.root.queues"])
    putHiveServerProperty("hive.server2.tez.default.queues", yarn_queues)

    # Interactive Queues property attributes
    putHiveServerPropertyAttribute = self.putPropertyAttribute(configurations, "hiveserver2-site")
    entries = []
    for queue in yarn_queues.split(","):
      entries.append({"label": str(queue) + " queue", "value": queue})
    putHiveServerPropertyAttribute("hive.server2.tez.default.queues", "entries", entries)

    # Security
    putHiveEnvProperty("hive_security_authorization", "None")
    if str(configurations["hive-env"]["properties"]["hive_security_authorization"]).lower() == "none":
      putHiveSiteProperty("hive.security.authorization.enabled", "false")
    else:
      putHiveSiteProperty("hive.security.authorization.enabled", "true")

    if str(configurations["hive-env"]["properties"]["hive_security_authorization"]).lower() == "sqlstdauth":
      auth_manager_value = str(configurations["hive-env"]["properties"]["hive.security.metastore.authorization.manager"])
      sqlstdauth_class = "org.apache.hadoop.hive.ql.security.authorization.MetaStoreAuthzAPIAuthorizerEmbedOnly"
      if sqlstdauth_class not in auth_manager_value:
        putHiveSiteProperty("hive.security.metastore.authorization.manager", auth_manager_value + "," + sqlstdauth_class)

    putHiveServerProperty("hive.server2.enable.doAs", "true")
    putHiveSiteProperty("hive.server2.use.SSL", "false")

  def recommendHBASEConfigurations(self, configurations, clusterData, services, hosts):
    super(HDPWIN22StackAdvisor, self).recommendHbaseEnvConfigurations(configurations, clusterData, services, hosts)
    putHbaseEnvPropertyAttributes = self.putPropertyAttribute(configurations, "hbase-env")

    rs_hosts = self.getHostsWithComponent("HBASE", "HBASE_REGIONSERVER", services, hosts)
    if rs_hosts is not None and len(rs_hosts) > 0:
      min_ram = rs_hosts[0]["Hosts"]["total_mem"]
      for host in rs_hosts:
        host_ram = host["Hosts"]["total_mem"]
        min_ram = min(min_ram, host_ram)

      putHbaseEnvPropertyAttributes('hbase_regionserver_heapsize', 'maximum', max(1024, int(min_ram*0.8/1024)))

    putHbaseSiteProperty = self.putProperty(configurations, "hbase-site", services)
    putHbaseSiteProperty("hbase.regionserver.global.memstore.upperLimit", '0.4')

    if 'hbase-env' in services['configurations'] and 'phoenix_sql_enabled' in services['configurations']['hbase-env']['properties']:
      if 'true' == services['configurations']['hbase-env']['properties']['phoenix_sql_enabled'].lower():
        putHbaseSiteProperty("hbase.regionserver.wal.codec", 'org.apache.hadoop.hbase.regionserver.wal.IndexedWALEditCodec')
      else:
        putHbaseSiteProperty("hbase.regionserver.wal.codec", 'org.apache.hadoop.hbase.regionserver.wal.WALCellCodec')

    # Recommend configs for bucket cache
    threshold = 23 # 2 Gb is reserved for other offheap memory
    mb = 1024
    if (int(clusterData["hbaseRam"]) > threshold):
      # To enable cache - calculate values
      regionserver_total_ram = int(clusterData["hbaseRam"]) * mb
      regionserver_heap_size = 20480
      regionserver_max_direct_memory_size = regionserver_total_ram - regionserver_heap_size
      hfile_block_cache_size = '0.4'
      block_cache_heap = 8192 # int(regionserver_heap_size * hfile_block_cache_size)
      hbase_regionserver_global_memstore_size = '0.4'
      reserved_offheap_memory = 2048
      bucketcache_offheap_memory = regionserver_max_direct_memory_size - reserved_offheap_memory
      hbase_bucketcache_size = block_cache_heap + bucketcache_offheap_memory
      hbase_bucketcache_percentage_in_combinedcache = float(bucketcache_offheap_memory) / hbase_bucketcache_size
      hbase_bucketcache_percentage_in_combinedcache_str = "{0:.4f}".format(math.ceil(hbase_bucketcache_percentage_in_combinedcache * 10000) / 10000.0)

      # Set values in hbase-site
      putHbaseProperty = self.putProperty(configurations, "hbase-site", services)
      putHbaseProperty('hfile.block.cache.size', hfile_block_cache_size)
      putHbaseProperty('hbase.regionserver.global.memstore.upperLimit', hbase_regionserver_global_memstore_size)
      putHbaseProperty('hbase.bucketcache.ioengine', 'offheap')
      putHbaseProperty('hbase.bucketcache.size', hbase_bucketcache_size)
      putHbaseProperty('hbase.bucketcache.percentage.in.combinedcache', hbase_bucketcache_percentage_in_combinedcache_str)

      # Enable in hbase-env
      putHbaseEnvProperty = self.putProperty(configurations, "hbase-env", services)
      putHbaseEnvProperty('hbase_max_direct_memory_size', regionserver_max_direct_memory_size)
      putHbaseEnvProperty('hbase_regionserver_heapsize', regionserver_heap_size)
    else:
      # Disable
      putHbaseProperty = self.putProperty(configurations, "hbase-site", services)
      putHbaseProperty('hbase.bucketcache.ioengine', '')
      putHbaseProperty('hbase.bucketcache.size', '')
      putHbaseProperty('hbase.bucketcache.percentage.in.combinedcache', '')

      putHbaseEnvProperty = self.putProperty(configurations, "hbase-env", services)
      putHbaseEnvProperty('hbase_max_direct_memory_size', '')

  def recommendTezConfigurations(self, configurations, clusterData, services, hosts):
    putTezProperty = self.putProperty(configurations, "tez-site")
    putTezProperty("tez.am.resource.memory.mb", int(clusterData['amMemory']) * 2 if int(clusterData['amMemory']) < 3072 else int(clusterData['amMemory']))

    taskResourceMemory = clusterData['mapMemory'] if clusterData['mapMemory'] > 2048 else int(clusterData['reduceMemory'])
    taskResourceMemory = min(clusterData['containers'] * clusterData['ramPerContainer'], taskResourceMemory)
    putTezProperty("tez.task.resource.memory.mb", taskResourceMemory)
    putTezProperty("tez.runtime.io.sort.mb", min(int(taskResourceMemory * 0.4), 2047))
    putTezProperty("tez.runtime.unordered.output.buffer.size-mb", int(taskResourceMemory * 0.075))

  def getServiceConfigurationValidators(self):
    parentValidators = super(HDPWIN22StackAdvisor, self).getServiceConfigurationValidators()
    childValidators = {
      "HDFS": {"hdfs-site": self.validateHDFSConfigurations,
               "hadoop-env": self.validateHDFSConfigurationsEnv},
      "HIVE": {"hive-site": self.validateHiveConfigurations},
      "HBASE": {"hbase-site": self.validateHBASEConfigurations,
                "hbase-env": self.validateHBASEEnvConfigurations},
      "MAPREDUCE2": {"mapred-site": self.validateMapReduce2Configurations},
      "TEZ": {"tez-site": self.validateTezConfigurations}
    }
    parentValidators.update(childValidators)
    return parentValidators

  def validateHDFSConfigurations(self, properties, recommendedDefaults, configurations, services, hosts):
    # We can not access property hadoop.security.authentication from the
    # other config (core-site). That's why we are using another heuristics here
    hdfs_site = properties
    core_site = getSiteProperties(configurations, "core-site")

    dfs_encrypt_data_transfer = 'dfs.encrypt.data.transfer'  # Hadoop Wire encryption
    try:
      wire_encryption_enabled = hdfs_site[dfs_encrypt_data_transfer] == "true"
    except KeyError:
      wire_encryption_enabled = False

    HTTP_ONLY = 'HTTP_ONLY'
    HTTPS_ONLY = 'HTTPS_ONLY'
    HTTP_AND_HTTPS = 'HTTP_AND_HTTPS'

    VALID_HTTP_POLICY_VALUES = [HTTP_ONLY, HTTPS_ONLY, HTTP_AND_HTTPS]
    VALID_TRANSFER_PROTECTION_VALUES = ['authentication', 'integrity', 'privacy']

    validationItems = []
    if (not wire_encryption_enabled and   # If wire encryption is enabled at Hadoop, it disables all our checks
            core_site['hadoop.security.authentication'] == 'kerberos' and
            core_site['hadoop.security.authorization'] == 'true'):
      # security is enabled

      dfs_http_policy = 'dfs.http.policy'
      dfs_datanode_address = 'dfs.datanode.address'
      datanode_http_address = 'dfs.datanode.http.address'
      datanode_https_address = 'dfs.datanode.https.address'
      data_transfer_protection = 'dfs.data.transfer.protection'

      try: # Params may be absent
        privileged_dfs_dn_port = (False, True)[getPort(hdfs_site[dfs_datanode_address]) is not None]
      except KeyError:
        privileged_dfs_dn_port = False
      try:
        privileged_dfs_http_port = (False, True)[getPort(hdfs_site[datanode_http_address]) is not None]
      except KeyError:
        privileged_dfs_http_port = False
      try:
        privileged_dfs_https_port = (False, True)[getPort(hdfs_site[datanode_https_address]) is not None]
      except KeyError:
        privileged_dfs_https_port = False
      try:
        dfs_http_policy_value = hdfs_site[dfs_http_policy]
      except KeyError:
        dfs_http_policy_value = HTTP_ONLY  # Default
      try:
        data_transfer_protection_value = hdfs_site[data_transfer_protection]
      except KeyError:
        data_transfer_protection_value = None

      if dfs_http_policy_value not in VALID_HTTP_POLICY_VALUES:
        validationItems.append({"config-name": dfs_http_policy,
                                "item": self.getWarnItem(
                                  "Invalid property value: {0}. Valid values are {1}".format(
                                    dfs_http_policy_value, VALID_HTTP_POLICY_VALUES))})

      # determine whether we use secure ports
      address_properties_with_warnings = []
      if dfs_http_policy_value == HTTPS_ONLY:
        if not privileged_dfs_dn_port and (privileged_dfs_https_port or datanode_https_address not in hdfs_site):
          important_properties = [dfs_datanode_address, datanode_https_address]
          message = "You set up datanode to use some non-secure ports. " \
                    "If you want to run Datanode under non-root user in a secure cluster, " \
                    "you should set all these properties {2} " \
                    "to use non-secure ports (if property {3} does not exist, " \
                    "just add it). You may also set up property {4} ('{5}' is a good default value). " \
                    "Also, set up WebHDFS with SSL as " \
                    "described in manual in order to be able to " \
                    "use HTTPS.".format(dfs_http_policy, dfs_http_policy_value, important_properties,
                                        datanode_https_address, data_transfer_protection,
                                        VALID_TRANSFER_PROTECTION_VALUES[0])
          address_properties_with_warnings.extend(important_properties)
      else:  # dfs_http_policy_value == HTTP_AND_HTTPS or HTTP_ONLY
        # We don't enforce datanode_https_address to use privileged ports here
        any_nonprivileged_ports_are_in_use = not privileged_dfs_dn_port or not privileged_dfs_http_port
        if any_nonprivileged_ports_are_in_use:
          important_properties = [dfs_datanode_address, datanode_http_address]
          message = "You have set up datanode to use some non-secure ports, but {0} is set to {1}. " \
                    "In a secure cluster, Datanode forbids using non-secure ports " \
                    "if {0} is not set to {3}. " \
                    "Please make sure that properties {2} use secure ports.".format(
            dfs_http_policy, dfs_http_policy_value, important_properties, HTTPS_ONLY)
          address_properties_with_warnings.extend(important_properties)

      # Generate port-related warnings if any
      for prop in address_properties_with_warnings:
        validationItems.append({"config-name": prop,
                                "item": self.getWarnItem(message)})

      # Check if it is appropriate to use dfs.data.transfer.protection
      if data_transfer_protection_value is not None:
        if dfs_http_policy_value in [HTTP_ONLY, HTTP_AND_HTTPS]:
          validationItems.append({"config-name": data_transfer_protection,
                                  "item": self.getWarnItem(
                                    "{0} property can not be used when {1} is set to any "
                                    "value other then {2}. Tip: When {1} property is not defined, it defaults to {3}".format(
                                      data_transfer_protection, dfs_http_policy, HTTPS_ONLY, HTTP_ONLY))})
        elif not data_transfer_protection_value in VALID_TRANSFER_PROTECTION_VALUES:
          validationItems.append({"config-name": data_transfer_protection,
                                  "item": self.getWarnItem(
                                    "Invalid property value: {0}. Valid values are {1}.".format(
                                      data_transfer_protection_value, VALID_TRANSFER_PROTECTION_VALUES))})
    return self.toConfigurationValidationProblems(validationItems, "hdfs-site")

  def validateHDFSConfigurationsEnv(self, properties, recommendedDefaults, configurations, services, hosts):
    validationItems = [ {"config-name": 'namenode_heapsize', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'namenode_heapsize')},
                        {"config-name": 'namenode_opt_newsize', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'namenode_opt_newsize')},
                        {"config-name": 'namenode_opt_maxnewsize', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'namenode_opt_maxnewsize')}]
    return self.toConfigurationValidationProblems(validationItems, "hadoop-env")

  def validateHiveConfigurations(self, properties, recommendedDefaults, configurations, services, hosts):
    super(HDPWIN22StackAdvisor, self).validateHiveConfigurations(properties, recommendedDefaults, configurations, services, hosts)
    validationItems = []
    stripe_size_values = [8388608, 16777216, 33554432, 67108864, 134217728, 268435456]
    stripe_size_property = "hive.exec.orc.default.stripe.size"
    if int(properties[stripe_size_property]) not in stripe_size_values:
      validationItems.append({"config-name": stripe_size_property, "item": self.getWarnItem("Correct values are ")})
    return self.toConfigurationValidationProblems(validationItems, "hive-site")

  def validateTezConfigurations(self, properties, recommendedDefaults, configurations, services, hosts):
    validationItems = [ {"config-name": 'tez.am.resource.memory.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'tez.am.resource.memory.mb')},
                        {"config-name": 'tez.task.resource.memory.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'tez.task.resource.memory.mb')},
                        {"config-name": 'tez.runtime.io.sort.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'tez.runtime.io.sort.mb')},
                        {"config-name": 'tez.runtime.unordered.output.buffer.size-mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'tez.runtime.unordered.output.buffer.size-mb')},]
    return self.toConfigurationValidationProblems(validationItems, "tez-site")

  def validateMapReduce2Configurations(self, properties, recommendedDefaults, configurations, services, hosts):
    validationItems = [ {"config-name": 'mapreduce.map.java.opts', "item": self.validateXmxValue(properties, recommendedDefaults, 'mapreduce.map.java.opts')},
                        {"config-name": 'mapreduce.reduce.java.opts', "item": self.validateXmxValue(properties, recommendedDefaults, 'mapreduce.reduce.java.opts')},
                        {"config-name": 'mapreduce.task.io.sort.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'mapreduce.task.io.sort.mb')},
                        {"config-name": 'mapreduce.map.memory.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'mapreduce.map.memory.mb')},
                        {"config-name": 'mapreduce.reduce.memory.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'mapreduce.reduce.memory.mb')},
                        {"config-name": 'yarn.app.mapreduce.am.resource.mb', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'yarn.app.mapreduce.am.resource.mb')},
                        {"config-name": 'yarn.app.mapreduce.am.command-opts', "item": self.validateXmxValue(properties, recommendedDefaults, 'yarn.app.mapreduce.am.command-opts')}]
    return self.toConfigurationValidationProblems(validationItems, "mapred-site")

  def validateHBASEConfigurations(self, properties, recommendedDefaults, configurations, services, hosts):
    super(HDPWIN22StackAdvisor, self).validateHbaseEnvConfigurations(properties, recommendedDefaults, configurations, services, hosts)
    hbase_site = properties
    validationItems = []

    prop_name1 = 'hbase.regionserver.global.memstore.upperLimit'
    prop_name2 = 'hfile.block.cache.size'
    props_max_sum = 0.8

    if not is_number(hbase_site[prop_name1]):
      validationItems.append({"config-name": prop_name1,
                              "item": self.getWarnItem(
                                "{0} should be float value".format(prop_name1))})
    elif not is_number(hbase_site[prop_name2]):
      validationItems.append({"config-name": prop_name2,
                              "item": self.getWarnItem(
                                "{0} should be float value".format(prop_name2))})
    elif float(hbase_site[prop_name1]) + float(hbase_site[prop_name2]) > props_max_sum:
      validationItems.append({"config-name": prop_name1,
                              "item": self.getWarnItem(
                                "{0} and {1} sum should not exceed {2}".format(prop_name1, prop_name2, props_max_sum))})

    return self.toConfigurationValidationProblems(validationItems, "hbase-site")

  def validateHBASEEnvConfigurations(self, properties, recommendedDefaults, configurations, services, hosts):
    hbase_env = properties
    validationItems = [ {"config-name": 'hbase_regionserver_heapsize', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'hbase_regionserver_heapsize')},
                        {"config-name": 'hbase_master_heapsize', "item": self.validatorLessThenDefaultValue(properties, recommendedDefaults, 'hbase_master_heapsize')} ]

    return self.toConfigurationValidationProblems(validationItems, "hbase-env")

def is_number(s):
  try:
    float(s)
    return True
  except ValueError:
    pass