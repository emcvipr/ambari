/*
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

package org.apache.ambari.server.upgrade;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.ambari.server.AmbariException;
import org.apache.ambari.server.api.services.AmbariMetaInfo;
import org.apache.ambari.server.configuration.Configuration;
import org.apache.ambari.server.controller.AmbariManagementController;
import org.apache.ambari.server.orm.DBAccessor.DBColumnInfo;
import org.apache.ambari.server.orm.dao.StackDAO;
import org.apache.ambari.server.orm.dao.DaoUtils;
import org.apache.ambari.server.orm.entities.StackEntity;
import org.apache.ambari.server.state.Cluster;
import org.apache.ambari.server.state.Clusters;
import org.apache.ambari.server.state.Service;
import org.apache.ambari.server.state.StackId;
import org.apache.ambari.server.state.stack.OsFamily;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.persist.Transactional;


/**
 * Upgrade catalog for version 2.1.0.
 */
public class UpgradeCatalog210 extends AbstractUpgradeCatalog {
  private static final String CLUSTERS_TABLE = "clusters";
  private static final String CLUSTER_HOST_MAPPING_TABLE = "ClusterHostMapping";
  private static final String HOSTS_TABLE = "hosts";
  private static final String HOST_COMPONENT_DESIRED_STATE_TABLE = "hostcomponentdesiredstate";
  private static final String HOST_COMPONENT_STATE_TABLE = "hostcomponentstate";
  private static final String HOST_STATE_TABLE = "hoststate";
  private static final String HOST_VERSION_TABLE = "host_version";
  private static final String HOST_ROLE_COMMAND_TABLE = "host_role_command";
  private static final String HOST_CONFIG_MAPPING_TABLE = "hostconfigmapping";
  private static final String CONFIG_GROUP_HOST_MAPPING_TABLE = "configgrouphostmapping";
  private static final String KERBEROS_PRINCIPAL_HOST_TABLE = "kerberos_principal_host";
  private static final String KERBEROS_PRINCIPAL_TABLE = "kerberos_principal";
  private static final String REQUEST_OPERATION_LEVEL_TABLE = "requestoperationlevel";
  private static final String SERVICE_CONFIG_HOSTS_TABLE = "serviceconfighosts";
  private static final String WIDGET_TABLE = "widget";
  private static final String WIDGET_LAYOUT_TABLE = "widget_layout";
  private static final String WIDGET_LAYOUT_USER_WIDGET_TABLE = "widget_layout_user_widget";
  private static final String VIEW_INSTANCE_TABLE = "viewinstance";
  private static final String VIEW_PARAMETER_TABLE = "viewparameter";
  private static final String STACK_TABLE = "stack";
  private static final String REPO_VERSION_TABLE = "repo_version";
  private static final String ALERT_HISTORY_TABLE = "alert_history";
  private static final String HOST_ID_COL = "host_id";
  private static final String HOST_NAME_COL = "host_name";
  private static final String PUBLIC_HOST_NAME_COL = "public_host_name";
  private static final String TOPOLOGY_REQUEST_TABLE = "topology_request";
  private static final String TOPOLOGY_HOST_GROUP_TABLE = "topology_hostgroup";
  private static final String TOPOLOGY_HOST_INFO_TABLE = "topology_host_info";
  private static final String TOPOLOGY_LOGICAL_REQUEST_TABLE = "topology_logical_request";
  private static final String TOPOLOGY_HOST_REQUEST_TABLE = "topology_host_request";
  private static final String TOPOLOGY_HOST_TASK_TABLE = "topology_host_task";
  private static final String TOPOLOGY_LOGICAL_TASK_TABLE = "topology_logical_task";

  // constants for stack table changes
  private static final String STACK_ID_COLUMN_NAME = "stack_id";
  private static final String DESIRED_STACK_ID_COLUMN_NAME = "desired_stack_id";
  private static final String CURRENT_STACK_ID_COLUMN_NAME = "current_stack_id";
  private static final String DESIRED_STACK_VERSION_COLUMN_NAME = "desired_stack_version";
  private static final String CURRENT_STACK_VERSION_COLUMN_NAME = "current_stack_version";
  private static final DBColumnInfo DESIRED_STACK_ID_COLUMN = new DBColumnInfo(DESIRED_STACK_ID_COLUMN_NAME, Long.class, null, null, true);
  private static final DBColumnInfo CURRENT_STACK_ID_COLUMN = new DBColumnInfo(CURRENT_STACK_ID_COLUMN_NAME, Long.class, null, null, true);
  private static final DBColumnInfo STACK_ID_COLUMN = new DBColumnInfo(STACK_ID_COLUMN_NAME, Long.class, null, null, true);

  @Inject
  DaoUtils daoUtils;

  @Inject
  private OsFamily osFamily;
  
  /**
   * {@inheritDoc}
   */
  @Override
  public String getSourceVersion() {
    return "2.0.0";
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getTargetVersion() {
    return "2.1.0";
  }

  /**
   * Logger.
   */
  private static final Logger LOG = LoggerFactory.getLogger
      (UpgradeCatalog210.class);

  // ----- Constructors ------------------------------------------------------

  /**
   * Don't forget to register new UpgradeCatalogs in {@link org.apache.ambari.server.upgrade.SchemaUpgradeHelper.UpgradeHelperModule#configure()}
   * @param injector Guice injector to track dependencies and uses bindings to inject them.
   */
  @Inject
  public UpgradeCatalog210(Injector injector) {
    super(injector);
    this.injector = injector;

    daoUtils = injector.getInstance(DaoUtils.class);
    osFamily = injector.getInstance(OsFamily.class);
  }

  // ----- AbstractUpgradeCatalog --------------------------------------------

  /**
   * {@inheritDoc}
   */
  @Override
  protected void executeDDLUpdates() throws AmbariException, SQLException {
    executeHostsDDLUpdates();
    executeWidgetDDLUpdates();
    executeStackDDLUpdates();
    executeTopologyDDLUpdates();
  }

  private void executeTopologyDDLUpdates() throws AmbariException, SQLException {
    List<DBColumnInfo> columns = new ArrayList<DBColumnInfo>();

    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("action", String.class, 255, null, false));
    columns.add(new DBColumnInfo("cluster_name", String.class, 100, null, false));
    columns.add(new DBColumnInfo("bp_name", String.class, 100, null, false));
    columns.add(new DBColumnInfo("cluster_properties", char[].class, null, null, false));
    columns.add(new DBColumnInfo("cluster_attributes", char[].class, null, null, false));
    columns.add(new DBColumnInfo("description", String.class, 1024, null, false));

    dbAccessor.createTable(TOPOLOGY_REQUEST_TABLE, columns, "id");

    columns.clear();
    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("group_properties", char[].class, null, null, false));
    columns.add(new DBColumnInfo("group_attributes", char[].class, null, null, false));
    columns.add(new DBColumnInfo("request_id", Long.class, null, null, false));

    dbAccessor.createTable(TOPOLOGY_HOST_GROUP_TABLE, columns, "id");
    dbAccessor.addFKConstraint(TOPOLOGY_HOST_GROUP_TABLE, "FK_hostgroup_req_id", "request_id", TOPOLOGY_REQUEST_TABLE, "id", true, false);

    columns.clear();
    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("request_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("group_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("fqdn", String.class, 255, null, true));
    columns.add(new DBColumnInfo("host_count", Integer.class, null, null, true));
    columns.add(new DBColumnInfo("predicate", String.class, 2048, null, true));

    dbAccessor.createTable(TOPOLOGY_HOST_INFO_TABLE, columns, "id");
    dbAccessor.addFKConstraint(TOPOLOGY_HOST_INFO_TABLE, "FK_hostinfo_group_id", "group_id", TOPOLOGY_HOST_GROUP_TABLE, "id", true, false);

    columns.clear();
    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("description", String.class, 1024, null, false));

    dbAccessor.createTable(TOPOLOGY_LOGICAL_REQUEST_TABLE, columns, "id");
    dbAccessor.addFKConstraint(TOPOLOGY_HOST_GROUP_TABLE, "FK_logicalreq_req_id", "request_id", TOPOLOGY_REQUEST_TABLE, "id", true, false);

    columns.clear();
    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("logical_request_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("group_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("stage_id", Integer.class, null, null, false));
    columns.add(new DBColumnInfo("host_name", String.class, 255, null, true));

    dbAccessor.createTable(TOPOLOGY_HOST_REQUEST_TABLE, columns, "id");
    dbAccessor.addFKConstraint(TOPOLOGY_HOST_REQUEST_TABLE, "FK_hostreq_logicalreq_id", "logical_request_id", TOPOLOGY_LOGICAL_REQUEST_TABLE, "id", true, false);
    dbAccessor.addFKConstraint(TOPOLOGY_HOST_REQUEST_TABLE, "FK_hostreq_group_id", "group_id", TOPOLOGY_HOST_GROUP_TABLE, "id", true, false);

    columns.clear();
    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("host_request_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("type", String.class, 255, null, false));
    dbAccessor.createTable(TOPOLOGY_HOST_TASK_TABLE, columns, "id");
    dbAccessor.addFKConstraint(TOPOLOGY_HOST_TASK_TABLE, "FK_hosttask_req_id", "host_request_id", TOPOLOGY_HOST_REQUEST_TABLE, "id", true, false);

    columns.clear();
    columns.add(new DBColumnInfo("id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("host_task_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("physical_task_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("component", String.class, 255, null, false));
    dbAccessor.createTable(TOPOLOGY_LOGICAL_TASK_TABLE, columns, "id");
    dbAccessor.addFKConstraint(TOPOLOGY_LOGICAL_TASK_TABLE, "FK_ltask_hosttask_id", "host_task_id", TOPOLOGY_HOST_TASK_TABLE, "id", true, false);
    dbAccessor.addFKConstraint(TOPOLOGY_LOGICAL_TASK_TABLE, "FK_ltask_hrc_id", "physical_task_id", "host_role_command", "task_id", false, false);

    // Sequence updates
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_host_info_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_host_request_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_host_task_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_logical_request_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_logical_task_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_request_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('topology_host_group_id_seq', 0)", false);
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public void onPostUpgrade() throws AmbariException, SQLException {
    cleanupStackUpdates();
  }

  /**
   * Execute all of the hosts DDL updates.
   *
   * @throws org.apache.ambari.server.AmbariException
   * @throws java.sql.SQLException
   */
  private void executeHostsDDLUpdates() throws AmbariException, SQLException {
    Configuration.DatabaseType databaseType = configuration.getDatabaseType();

    String randomHostName = null;
    if (dbAccessor.tableHasData(HOST_ROLE_COMMAND_TABLE)) {
      randomHostName = getRandomHostName();
      if (StringUtils.isBlank(randomHostName)) {
        throw new AmbariException("UpgradeCatalog210 could not retrieve a random host_name from the hosts table while running executeHostsDDLUpdates.");
      }
    }

    dbAccessor.addColumn(HOSTS_TABLE, new DBColumnInfo(HOST_ID_COL, Long.class, null, null, true));

    // Sequence value for the hosts table primary key. First record will be 1, so ambari_sequence value must be 0.
    Long hostId = 0L;
    ResultSet resultSet = null;
    try {
      // Notice that hosts are ordered by host_id ASC, so any null values are last.
      resultSet = dbAccessor.executeSelect("SELECT host_name, host_id FROM hosts ORDER BY host_id ASC, host_name ASC");
      hostId = populateHostsId(resultSet);
    } finally {
      if (resultSet != null) {
        resultSet.close();
      }
    }

    // Insert host id number into ambari_sequences
    dbAccessor.executeQuery("INSERT INTO ambari_sequences (sequence_name, sequence_value) VALUES ('host_id_seq', " + hostId + ")");

    // Make the hosts id non-null after all the values are populated
    if (databaseType == Configuration.DatabaseType.DERBY) {
      // This is a workaround for UpgradeTest.java unit test
      dbAccessor.executeQuery("ALTER TABLE " + HOSTS_TABLE + " ALTER column " + HOST_ID_COL + " NOT NULL");
    } else {
      dbAccessor.alterColumn(HOSTS_TABLE, new DBColumnInfo(HOST_ID_COL, Long.class, null, null, false));
    }


    // Drop the 8 FK constraints in the host-related tables. They will be recreated later after the PK is changed.
    // The only host-related table not being included is alert_history.
    if (databaseType == Configuration.DatabaseType.DERBY) {
      dbAccessor.executeQuery("ALTER TABLE " + HOST_COMPONENT_STATE_TABLE + " DROP CONSTRAINT hostcomponentstate_host_name");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_COMPONENT_DESIRED_STATE_TABLE + " DROP CONSTRAINT hstcmponentdesiredstatehstname");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_ROLE_COMMAND_TABLE + " DROP CONSTRAINT FK_host_role_command_host_name");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_STATE_TABLE + " DROP CONSTRAINT FK_hoststate_host_name");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_VERSION_TABLE + " DROP CONSTRAINT FK_host_version_host_name");
      dbAccessor.executeQuery("ALTER TABLE " + CONFIG_GROUP_HOST_MAPPING_TABLE + " DROP CONSTRAINT FK_cghm_hname");
      // FK_krb_pr_host_hostname used to have a CASCADE DELETE, which is not needed.
      dbAccessor.executeQuery("ALTER TABLE " + KERBEROS_PRINCIPAL_HOST_TABLE + " DROP CONSTRAINT FK_krb_pr_host_hostname");
      // FK_krb_pr_host_principalname used to have a CASCADE DELETE, which is not needed, so it will be recreated without it.
      dbAccessor.executeQuery("ALTER TABLE " + KERBEROS_PRINCIPAL_HOST_TABLE + " DROP CONSTRAINT FK_krb_pr_host_principalname");

      // This FK name is actually different on Derby.
      dbAccessor.executeQuery("ALTER TABLE " + HOST_CONFIG_MAPPING_TABLE + " DROP CONSTRAINT FK_hostconfigmapping_host_name");
    } else {
      dbAccessor.dropConstraint(HOST_COMPONENT_STATE_TABLE, "hostcomponentstate_host_name");
      dbAccessor.dropConstraint(HOST_COMPONENT_DESIRED_STATE_TABLE, "hstcmponentdesiredstatehstname");
      dbAccessor.dropConstraint(HOST_ROLE_COMMAND_TABLE, "FK_host_role_command_host_name");
      dbAccessor.dropConstraint(HOST_STATE_TABLE, "FK_hoststate_host_name");
      dbAccessor.dropConstraint(HOST_VERSION_TABLE, "FK_host_version_host_name");
      dbAccessor.dropConstraint(CONFIG_GROUP_HOST_MAPPING_TABLE, "FK_cghm_hname");
      // FK_krb_pr_host_hostname used to have a CASCADE DELETE, which is not needed.
      dbAccessor.dropConstraint(KERBEROS_PRINCIPAL_HOST_TABLE, "FK_krb_pr_host_hostname");
      // FK_krb_pr_host_principalname used to have a CASCADE DELETE, which is not needed, so it will be recreated without it.
      dbAccessor.executeQuery("ALTER TABLE " + KERBEROS_PRINCIPAL_HOST_TABLE + " DROP CONSTRAINT FK_krb_pr_host_principalname");

      dbAccessor.dropConstraint(HOST_CONFIG_MAPPING_TABLE, "FK_hostconfmapping_host_name");
    }

    // In Ambari 2.0.0, there were discrepancies with the FK in the ClusterHostMapping table in the Postgres databases.
    // They were either swapped, or pointing to the wrong table. Ignore failures for both of these.
    try {
      dbAccessor.dropConstraint(CLUSTER_HOST_MAPPING_TABLE, "ClusterHostMapping_host_name", true);
    } catch (Exception e) {
      LOG.warn("Performed best attempt at deleting FK ClusterHostMapping_host_name. " +
          "It is possible it did not exist or the deletion failed. " +  e.getMessage());
    }
    try {
      dbAccessor.dropConstraint(CLUSTER_HOST_MAPPING_TABLE, "ClusterHostMapping_cluster_id", true);
    } catch (Exception e) {
      LOG.warn("Performed best attempt at deleting FK ClusterHostMapping_cluster_id. " +
          "It is possible it did not exist or the deletion failed. " +  e.getMessage());
    }

    // Re-add the FK to the cluster_id; will add the host_id at the end.
    dbAccessor.addFKConstraint(CLUSTER_HOST_MAPPING_TABLE, "FK_clhostmapping_cluster_id",
        "cluster_id", CLUSTERS_TABLE, "cluster_id", false);

    // Drop the PK, and recreate it on the host_id instead
    if (databaseType == Configuration.DatabaseType.DERBY) {
      String constraintName = getDerbyTableConstraintName("p", HOSTS_TABLE);
      if (null != constraintName) {
        dbAccessor.executeQuery("ALTER TABLE " + HOSTS_TABLE + " DROP CONSTRAINT " + constraintName);
      }
    } else {
      dbAccessor.executeQuery("ALTER TABLE " + HOSTS_TABLE + " DROP CONSTRAINT hosts_pkey");
    }
    dbAccessor.executeQuery("ALTER TABLE " + HOSTS_TABLE + " ADD CONSTRAINT PK_hosts_id PRIMARY KEY (host_id)");
    dbAccessor.executeQuery("ALTER TABLE " + HOSTS_TABLE + " ADD CONSTRAINT UQ_hosts_host_name UNIQUE (host_name)");


    // Add host_id to the host-related tables, and populate the host_id, one table at a time.
    String[] tablesToAddHostID = new String[] {
        CONFIG_GROUP_HOST_MAPPING_TABLE,
        CLUSTER_HOST_MAPPING_TABLE,
        HOST_CONFIG_MAPPING_TABLE,
        HOST_COMPONENT_STATE_TABLE,
        HOST_COMPONENT_DESIRED_STATE_TABLE,
        HOST_ROLE_COMMAND_TABLE,
        HOST_STATE_TABLE,
        HOST_VERSION_TABLE,
        KERBEROS_PRINCIPAL_HOST_TABLE,
        REQUEST_OPERATION_LEVEL_TABLE,
        SERVICE_CONFIG_HOSTS_TABLE
    };

    for (String tableName : tablesToAddHostID) {
      dbAccessor.addColumn(tableName, new DBColumnInfo(HOST_ID_COL, Long.class, null, null, true));

      // The column name is different for one table
      String hostNameColumnName = tableName == SERVICE_CONFIG_HOSTS_TABLE ? "hostname" : "host_name";

      if (dbAccessor.tableHasData(tableName)) {
        dbAccessor.executeQuery("UPDATE " + tableName + " t SET host_id = (SELECT host_id FROM hosts h WHERE h.host_name = t." + hostNameColumnName + ") WHERE t.host_id IS NULL AND t." + hostNameColumnName + " IS NOT NULL");

        // For legacy reasons, the hostrolecommand table will contain "none" for some records where the host_name was not important.
        // These records were populated during Finalize in Rolling Upgrade, so they must be updated to use a valid host_name.
        if (tableName == HOST_ROLE_COMMAND_TABLE && StringUtils.isNotBlank(randomHostName)) {
          dbAccessor.executeQuery("UPDATE " + tableName + " t SET host_id = (SELECT host_id FROM hosts h WHERE h.host_name = '" + randomHostName + "') WHERE t.host_id IS NULL AND t.host_name = 'none'");
        }
      }

      // The one exception for setting NOT NULL is the requestoperationlevel table
      if (tableName != REQUEST_OPERATION_LEVEL_TABLE) {
        if (databaseType == Configuration.DatabaseType.DERBY) {
          // This is a workaround for UpgradeTest.java unit test
          dbAccessor.executeQuery("ALTER TABLE " + tableName + " ALTER column " + HOST_ID_COL + " NOT NULL");
        } else {
          dbAccessor.executeQuery("ALTER TABLE " + tableName + " ALTER column " + HOST_ID_COL + " SET NOT NULL");
        }
      }
    }

    // These are the FKs that have already been corrected.
    dbAccessor.addFKConstraint(CONFIG_GROUP_HOST_MAPPING_TABLE, "FK_cghm_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(CLUSTER_HOST_MAPPING_TABLE, "FK_clusterhostmapping_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(HOST_CONFIG_MAPPING_TABLE, "FK_hostconfmapping_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(HOST_COMPONENT_STATE_TABLE, "FK_hostcomponentstate_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(HOST_COMPONENT_DESIRED_STATE_TABLE, "FK_hcdesiredstate_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(HOST_ROLE_COMMAND_TABLE, "FK_host_role_command_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(HOST_STATE_TABLE, "FK_hoststate_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(KERBEROS_PRINCIPAL_HOST_TABLE, "FK_krb_pr_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);
    dbAccessor.addFKConstraint(KERBEROS_PRINCIPAL_HOST_TABLE, "FK_krb_pr_host_principalname",
        "principal_name", KERBEROS_PRINCIPAL_TABLE, "principal_name", false);
    dbAccessor.addFKConstraint(SERVICE_CONFIG_HOSTS_TABLE, "FK_scvhosts_host_id",
        "host_id", HOSTS_TABLE, "host_id", false);


    // For any tables where the host_name was part of the PK, need to drop the PK, and recreate it with the host_id
    String[] tablesWithHostNameInPK =  new String[] {
        CONFIG_GROUP_HOST_MAPPING_TABLE,
        CLUSTER_HOST_MAPPING_TABLE,
        HOST_CONFIG_MAPPING_TABLE,
        HOST_COMPONENT_STATE_TABLE,
        HOST_COMPONENT_DESIRED_STATE_TABLE,
        HOST_STATE_TABLE,
        KERBEROS_PRINCIPAL_HOST_TABLE,
        SERVICE_CONFIG_HOSTS_TABLE
    };

    if (databaseType == Configuration.DatabaseType.DERBY) {
      for (String tableName : tablesWithHostNameInPK) {
        String constraintName = getDerbyTableConstraintName("p", tableName);
        if (null != constraintName) {
          dbAccessor.executeQuery("ALTER TABLE " + tableName + " DROP CONSTRAINT " + constraintName);
        }
      }
    } else {
      dbAccessor.executeQuery("ALTER TABLE " + CONFIG_GROUP_HOST_MAPPING_TABLE + " DROP CONSTRAINT configgrouphostmapping_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + CLUSTER_HOST_MAPPING_TABLE + " DROP CONSTRAINT clusterhostmapping_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_CONFIG_MAPPING_TABLE + " DROP CONSTRAINT hostconfigmapping_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_COMPONENT_STATE_TABLE + " DROP CONSTRAINT hostcomponentstate_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_COMPONENT_DESIRED_STATE_TABLE + " DROP CONSTRAINT hostcomponentdesiredstate_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + HOST_STATE_TABLE + " DROP CONSTRAINT hoststate_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + KERBEROS_PRINCIPAL_HOST_TABLE + " DROP CONSTRAINT kerberos_principal_host_pkey");
      dbAccessor.executeQuery("ALTER TABLE " + SERVICE_CONFIG_HOSTS_TABLE + " DROP CONSTRAINT serviceconfighosts_pkey");
    }
    dbAccessor.executeQuery("ALTER TABLE " + CONFIG_GROUP_HOST_MAPPING_TABLE +
        " ADD CONSTRAINT configgrouphostmapping_pkey PRIMARY KEY (config_group_id, host_id)");
    dbAccessor.executeQuery("ALTER TABLE " + CLUSTER_HOST_MAPPING_TABLE +
        " ADD CONSTRAINT clusterhostmapping_pkey PRIMARY KEY (cluster_id, host_id)");
    dbAccessor.executeQuery("ALTER TABLE " + HOST_CONFIG_MAPPING_TABLE +
        " ADD CONSTRAINT hostconfigmapping_pkey PRIMARY KEY (cluster_id, host_id, type_name, create_timestamp)");
    dbAccessor.executeQuery("ALTER TABLE " + HOST_COMPONENT_STATE_TABLE +
        " ADD CONSTRAINT hostcomponentstate_pkey PRIMARY KEY (cluster_id, component_name, host_id, service_name)");
    dbAccessor.executeQuery("ALTER TABLE " + HOST_COMPONENT_DESIRED_STATE_TABLE +
        " ADD CONSTRAINT hostcomponentdesiredstate_pkey PRIMARY KEY (cluster_id, component_name, host_id, service_name)");
    dbAccessor.executeQuery("ALTER TABLE " + HOST_STATE_TABLE +
        " ADD CONSTRAINT hoststate_pkey PRIMARY KEY (host_id)");
    dbAccessor.executeQuery("ALTER TABLE " + KERBEROS_PRINCIPAL_HOST_TABLE +
        " ADD CONSTRAINT kerberos_principal_host_pkey PRIMARY KEY (principal_name, host_id)");
    dbAccessor.executeQuery("ALTER TABLE " + SERVICE_CONFIG_HOSTS_TABLE +
        " ADD CONSTRAINT serviceconfighosts_pkey PRIMARY KEY (service_config_id, host_id)");

    // Finish by deleting the unnecessary host_name columns.
    dbAccessor.dropColumn(CONFIG_GROUP_HOST_MAPPING_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(CLUSTER_HOST_MAPPING_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(HOST_CONFIG_MAPPING_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(HOST_COMPONENT_STATE_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(HOST_COMPONENT_DESIRED_STATE_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(HOST_ROLE_COMMAND_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(HOST_STATE_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(HOST_VERSION_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(KERBEROS_PRINCIPAL_HOST_TABLE, HOST_NAME_COL);
    dbAccessor.dropColumn(REQUEST_OPERATION_LEVEL_TABLE, HOST_NAME_COL);

    // Notice that the column name doesn't have an underscore here.
    dbAccessor.dropColumn(SERVICE_CONFIG_HOSTS_TABLE, "hostname");

    // view columns for cluster association
    dbAccessor.addColumn(VIEW_INSTANCE_TABLE, new DBColumnInfo("cluster_handle", String.class, 255, null, true));
    dbAccessor.addColumn(VIEW_PARAMETER_TABLE, new DBColumnInfo("cluster_config", String.class, 255, null, true));

    // Update host names to be case insensitive
    String UPDATE_TEMPLATE = "UPDATE {0} SET {1} = lower({1})";
    // First remove duplicate hosts
    removeDuplicateHosts();
    // Lowercase host name in hosts
    String updateHostName = MessageFormat.format(UPDATE_TEMPLATE, HOSTS_TABLE, HOST_NAME_COL);
    dbAccessor.executeQuery(updateHostName);
    // Lowercase public host name in hosts
    String updatePublicHostName = MessageFormat.format(UPDATE_TEMPLATE, HOSTS_TABLE, PUBLIC_HOST_NAME_COL);
    dbAccessor.executeQuery(updatePublicHostName);
    // Lowercase host name in alert_history
    String updateAlertHostName = MessageFormat.format(UPDATE_TEMPLATE, ALERT_HISTORY_TABLE, HOST_NAME_COL);
    dbAccessor.executeQuery(updateAlertHostName);
  }

  private void executeWidgetDDLUpdates() throws AmbariException, SQLException {
    List<DBColumnInfo> columns = new ArrayList<DBColumnInfo>();

    columns.add(new DBColumnInfo("id", Long.class,    null,  null, false));
    columns.add(new DBColumnInfo("widget_name", String.class,  255,   null, false));
    columns.add(new DBColumnInfo("widget_type", String.class,  255,   null, false));
    columns.add(new DBColumnInfo("metrics", char[].class, null, null, true));
    columns.add(new DBColumnInfo("time_created", Long.class,  null,   null, false));
    columns.add(new DBColumnInfo("author", String.class,  255,   null, true));
    columns.add(new DBColumnInfo("description", String.class,  255,   null, true));
    columns.add(new DBColumnInfo("default_section_name", String.class,  255,   null, true));
    columns.add(new DBColumnInfo("scope", String.class,  255,   null, true));
    columns.add(new DBColumnInfo("widget_values", char[].class, null, null, true));
    columns.add(new DBColumnInfo("properties", char[].class, null, null, true));
    columns.add(new DBColumnInfo("cluster_id", Long.class,  null,   null, false));
    dbAccessor.createTable(WIDGET_TABLE, columns, "id");

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("id", Long.class,    null,  null, false));
    columns.add(new DBColumnInfo("layout_name", String.class,  255,   null, false));
    columns.add(new DBColumnInfo("section_name", String.class,  255,   null, false));
    columns.add(new DBColumnInfo("cluster_id", Long.class,  null,   null, false));
    columns.add(new DBColumnInfo("scope", String.class,  255,   null, false));
    columns.add(new DBColumnInfo("user_name", String.class,  255,   null, false));
    columns.add(new DBColumnInfo("display_name", String.class,  255,   null, true));

    dbAccessor.createTable(WIDGET_LAYOUT_TABLE, columns, "id");

    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("widget_layout_id", Long.class,    null,  null, false));
    columns.add(new DBColumnInfo("widget_id", Long.class,    null,  null, false));
    columns.add(new DBColumnInfo("widget_order", Integer.class,    null,  null, false));
    dbAccessor.createTable(WIDGET_LAYOUT_USER_WIDGET_TABLE, columns, "widget_layout_id", "widget_id");
    dbAccessor.addFKConstraint(WIDGET_LAYOUT_USER_WIDGET_TABLE, "FK_widget_layout_id", "widget_layout_id", "widget_layout", "id", true, false);
    dbAccessor.addFKConstraint(WIDGET_LAYOUT_USER_WIDGET_TABLE, "FK_widget_id", "widget_id", "widget", "id", true, false);

    //Alter users to store active widget layouts
    dbAccessor.addColumn("users", new DBColumnInfo("active_widget_layouts", String.class, 1024, null, true));

    // Sequence updates
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('widget_id_seq', 0)", false);
    dbAccessor.executeQuery("INSERT INTO ambari_sequences(sequence_name, sequence_value) values ('widget_layout_id_seq', 0)", false);
  }

  /**
   * Adds the stack table, FKs, and constraints.
   */
  private void executeStackDDLUpdates() throws AmbariException, SQLException {
    // stack table creation
    ArrayList<DBColumnInfo> columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo("stack_id", Long.class, null, null, false));
    columns.add(new DBColumnInfo("stack_name", String.class, 255, null, false));
    columns.add(new DBColumnInfo("stack_version", String.class, 255, null,
        false));

    dbAccessor.createTable(STACK_TABLE, columns, "stack_id");

    dbAccessor.executeQuery("ALTER TABLE " + STACK_TABLE
        + " ADD CONSTRAINT unq_stack UNIQUE (stack_name,stack_version)", false);

    dbAccessor.executeQuery(
        "INSERT INTO ambari_sequences(sequence_name, sequence_value) VALUES('stack_id_seq', 0)",
        false);

    // create the new stack ID columns NULLABLE for now since we need to insert
    // data into them later on (we'll change them to NOT NULL after that)
    dbAccessor.addColumn(CLUSTERS_TABLE, DESIRED_STACK_ID_COLUMN);
    dbAccessor.addColumn("hostcomponentdesiredstate", DESIRED_STACK_ID_COLUMN);
    dbAccessor.addColumn("servicecomponentdesiredstate", DESIRED_STACK_ID_COLUMN);
    dbAccessor.addColumn("servicedesiredstate", DESIRED_STACK_ID_COLUMN);

    dbAccessor.addFKConstraint(CLUSTERS_TABLE, "fk_clusters_desired_stack_id", DESIRED_STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint("hostcomponentdesiredstate", "fk_hcds_desired_stack_id", DESIRED_STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint("servicecomponentdesiredstate", "fk_scds_desired_stack_id", DESIRED_STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint("servicedesiredstate", "fk_sds_desired_stack_id", DESIRED_STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);

    dbAccessor.addColumn("clusterstate", CURRENT_STACK_ID_COLUMN);
    dbAccessor.addColumn("hostcomponentstate", CURRENT_STACK_ID_COLUMN);

    dbAccessor.addFKConstraint("clusterstate", "fk_cs_current_stack_id", CURRENT_STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint("hostcomponentstate", "fk_hcs_current_stack_id", CURRENT_STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);

    dbAccessor.addColumn("clusterconfig", STACK_ID_COLUMN);
    dbAccessor.addColumn("serviceconfig", STACK_ID_COLUMN);
    dbAccessor.addColumn("blueprint", STACK_ID_COLUMN);
    dbAccessor.addColumn(REPO_VERSION_TABLE, STACK_ID_COLUMN);

    dbAccessor.addFKConstraint("clusterconfig", "fk_clusterconfig_stack_id", STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint("serviceconfig", "fk_serviceconfig_stack_id", STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint("blueprint", "fk_blueprint_stack_id", STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);
    dbAccessor.addFKConstraint(REPO_VERSION_TABLE, "fk_repoversion_stack_id", STACK_ID_COLUMN_NAME, STACK_TABLE, STACK_ID_COLUMN_NAME, true);

    // drop the unique constraint for the old column and add the new one
    dbAccessor.dropConstraint(REPO_VERSION_TABLE, "uq_repo_version_stack_version");
    dbAccessor.executeQuery("ALTER TABLE repo_version ADD CONSTRAINT uq_repo_version_stack_id UNIQUE (stack_id, version)");
  }

  /**
   * Adds the stack table and constraints.
   */
  protected void executeStackPreDMLUpdates() throws AmbariException, SQLException {
    Gson gson = new Gson();

    injector.getInstance(AmbariMetaInfo.class);

    StackDAO stackDAO = injector.getInstance(StackDAO.class);
    List<StackEntity> stacks = stackDAO.findAll();
    Map<Long,String> entityToJsonMap = new HashMap<Long, String>();

    // build a mapping of stack entity to old-school JSON
    for( StackEntity stack : stacks ){
      StackId stackId = new StackId(stack.getStackName(),
          stack.getStackVersion());
      String stackJson = gson.toJson(stackId);
      entityToJsonMap.put(stack.getStackId(), stackJson);
    }

    // use a bulk update on all tables to populate the new FK columns
    String UPDATE_TEMPLATE = "UPDATE {0} SET {1} = {2} WHERE {3} = ''{4}''";
    String UPDATE_BLUEPRINT_TEMPLATE = "UPDATE blueprint SET stack_id = {0} WHERE stack_name = ''{1}'' AND stack_version = ''{2}''";

    Set<Long> stackEntityIds = entityToJsonMap.keySet();
    for (Long stackEntityId : stackEntityIds) {
      StackEntity stackEntity = stackDAO.findById(stackEntityId);
      String outdatedJson = entityToJsonMap.get(stackEntityId);

      String clustersSQL = MessageFormat.format(UPDATE_TEMPLATE, "clusters",
          DESIRED_STACK_ID_COLUMN_NAME, stackEntityId,
          DESIRED_STACK_VERSION_COLUMN_NAME, outdatedJson);

      String hostComponentDesiredStateSQL = MessageFormat.format(
          UPDATE_TEMPLATE, "hostcomponentdesiredstate",
          DESIRED_STACK_ID_COLUMN_NAME, stackEntityId,
          DESIRED_STACK_VERSION_COLUMN_NAME, outdatedJson);

      String serviceComponentDesiredStateSQL = MessageFormat.format(
          UPDATE_TEMPLATE, "servicecomponentdesiredstate",
          DESIRED_STACK_ID_COLUMN_NAME, stackEntityId,
          DESIRED_STACK_VERSION_COLUMN_NAME, outdatedJson);

      String serviceDesiredStateSQL = MessageFormat.format(UPDATE_TEMPLATE,
          "servicedesiredstate",
          DESIRED_STACK_ID_COLUMN_NAME, stackEntityId,
          DESIRED_STACK_VERSION_COLUMN_NAME, outdatedJson);

      String clusterStateSQL = MessageFormat.format(UPDATE_TEMPLATE,
          "clusterstate", CURRENT_STACK_ID_COLUMN_NAME, stackEntityId,
          CURRENT_STACK_VERSION_COLUMN_NAME, outdatedJson);

      String hostComponentStateSQL = MessageFormat.format(UPDATE_TEMPLATE,
          "hostcomponentstate", CURRENT_STACK_ID_COLUMN_NAME, stackEntityId,
          CURRENT_STACK_VERSION_COLUMN_NAME, outdatedJson);

      String blueprintSQL = MessageFormat.format(UPDATE_BLUEPRINT_TEMPLATE,
          stackEntityId, stackEntity.getStackName(),
          stackEntity.getStackVersion());

      String repoVersionSQL = MessageFormat.format(UPDATE_TEMPLATE,
          REPO_VERSION_TABLE, STACK_ID_COLUMN_NAME, stackEntityId, "stack",
          outdatedJson);

      dbAccessor.executeQuery(clustersSQL);
      dbAccessor.executeQuery(hostComponentDesiredStateSQL);
      dbAccessor.executeQuery(serviceComponentDesiredStateSQL);
      dbAccessor.executeQuery(serviceDesiredStateSQL);
      dbAccessor.executeQuery(clusterStateSQL);
      dbAccessor.executeQuery(hostComponentStateSQL);
      dbAccessor.executeQuery(blueprintSQL);
      dbAccessor.executeQuery(repoVersionSQL);
    }

    // for the tables with no prior stack, set these based on the cluster's
    // stack for each cluster defined
    String INSERT_STACK_ID_TEMPLATE = "UPDATE {0} SET {1} = {2} WHERE cluster_id = {3}";
    ResultSet resultSet = dbAccessor.executeSelect("SELECT * FROM clusters");
    try {
      while (resultSet.next()) {
        long clusterId = resultSet.getLong("cluster_id");
        String stackJson = resultSet.getString(DESIRED_STACK_VERSION_COLUMN_NAME);
        StackId stackId = gson.fromJson(stackJson, StackId.class);

        StackEntity stackEntity = stackDAO.find(stackId.getStackName(),
            stackId.getStackVersion());

        String clusterConfigSQL = MessageFormat.format(
            INSERT_STACK_ID_TEMPLATE, "clusterconfig", STACK_ID_COLUMN_NAME,
            stackEntity.getStackId(), clusterId);

        String serviceConfigSQL = MessageFormat.format(
            INSERT_STACK_ID_TEMPLATE, "serviceconfig", STACK_ID_COLUMN_NAME,
            stackEntity.getStackId(), clusterId);

        dbAccessor.executeQuery(clusterConfigSQL);
        dbAccessor.executeQuery(serviceConfigSQL);
      }
    } finally {
      if (null != resultSet) {
        resultSet.close();
      }
    }
  }

  /**
   * Copy cluster & service widgets from stack to DB.
   */
  protected void initializeClusterAndServiceWidgets() throws AmbariException {
    AmbariManagementController controller = injector.getInstance(AmbariManagementController.class);
    Clusters clusters = controller.getClusters();
    if (clusters == null) {
      return;
    }

    Map<String, Cluster> clusterMap = clusters.getClusters();

    if (clusterMap != null && !clusterMap.isEmpty()) {
      for (Cluster cluster : clusterMap.values()) {
        controller.initializeWidgetsAndLayouts(cluster, null);

        Map<String, Service> serviceMap = cluster.getServices();
        if (serviceMap != null && !serviceMap.isEmpty()) {
          for (Service service : serviceMap.values()) {
            controller.initializeWidgetsAndLayouts(cluster, service);
          }
        }
      }
    }
  }

  // ----- UpgradeCatalog ----------------------------------------------------

  /**
   * Populate the id of the hosts table with an auto-increment int.
   * @param resultSet Rows from the hosts table, sorted first by host_id
   * @return Returns an integer with the id for the next host record to be inserted.
   * @throws SQLException
   */
  @Transactional
  private Long populateHostsId(ResultSet resultSet) throws SQLException {
    Long hostId = 0L;
    if (resultSet != null) {
      try {
        while (resultSet.next()) {
          hostId++;
          final String hostName = resultSet.getString(1);

          if (StringUtils.isNotBlank(hostName)) {
            dbAccessor.executeQuery("UPDATE " + HOSTS_TABLE + " SET host_id = " + hostId +
                " WHERE " + HOST_NAME_COL + " = '" + hostName + "'");
          }
        }
      } catch (Exception e) {
        LOG.error("Unable to populate the id of the hosts. " + e.getMessage());
      }
    }
    return hostId;
  }

  private String getRandomHostName() throws SQLException {
    String randomHostName = null;
    ResultSet resultSet = null;
    try {
      resultSet = dbAccessor.executeSelect("SELECT " + HOST_NAME_COL + " FROM " + HOSTS_TABLE + " ORDER BY " + HOST_NAME_COL + " ASC");
      if (resultSet != null && resultSet.next()) {
        randomHostName = resultSet.getString(1);
      }
    } catch (Exception e) {
      LOG.error("Failed to retrieve random host name. Exception: " + e.getMessage());
    } finally {
      if (resultSet != null) {
        resultSet.close();
      }
    }
    return randomHostName;
  }

  /**
   * Remove duplicate hosts before making host name case-insensitive
   * @throws SQLException
   */
  private void removeDuplicateHosts() throws SQLException {
    // Select hosts not in the cluster
    String hostsNotInClusterQuery = MessageFormat.format(
        "SELECT * FROM {0} WHERE {1} NOT IN (SELECT {1} FROM {2})",
        HOSTS_TABLE, HOST_ID_COL, CLUSTER_HOST_MAPPING_TABLE);
    ResultSet hostsNotInCluster = null;
    try {
      hostsNotInCluster = dbAccessor.executeSelect(hostsNotInClusterQuery);
      if(hostsNotInCluster != null) {
        while (hostsNotInCluster.next()) {
          long hostToDeleteId = hostsNotInCluster.getLong(HOST_ID_COL);
          String hostToDeleteName = hostsNotInCluster.getString(HOST_NAME_COL);
          String duplicateHostsQuery = "SELECT count(*) FROM hosts WHERE lower(host_name) = '" + hostToDeleteName + "' AND host_id != " + hostToDeleteId;
          long count = 0;
          ResultSet duplicateHosts = null;
          try {
            duplicateHosts = dbAccessor.executeSelect(duplicateHostsQuery);
            if (duplicateHosts != null && duplicateHosts.next()) {
              count = duplicateHosts.getLong(1);
            }
          } finally {
            if (null != duplicateHosts) {
              duplicateHosts.close();
            }
          }
          if (count > 0) {
            // Delete hosts and host_state table entries for this duplicate host entry
            dbAccessor.executeQuery(
                MessageFormat.format("DELETE from {0} WHERE {1} = {2}", HOST_STATE_TABLE, HOST_ID_COL, hostToDeleteId));
            dbAccessor.executeQuery(
                MessageFormat.format("DELETE from {0} WHERE {1} = {2}", HOSTS_TABLE, HOST_ID_COL, hostToDeleteId));
          }
        }
      }
    } finally {
      if (null != hostsNotInCluster) {
        hostsNotInCluster.close();
      }
    }
  }

  /**
   * Get the constraint name created by Derby if one was not specified for the table.
   * @param type Constraint-type, either, "p" (Primary), "c" (Check), "f" (Foreign), "u" (Unique)
   * @param tableName Table Name
   * @return Return the constraint name, or null if not found.
   * @throws SQLException
   */
  private String getDerbyTableConstraintName(String type, String tableName) throws SQLException {
    ResultSet resultSet = null;
    boolean found = false;
    String constraint = null;

    try {
      resultSet = dbAccessor.executeSelect("SELECT c.constraintname, c.type, t.tablename FROM sys.sysconstraints c, sys.systables t WHERE c.tableid = t.tableid");
      while(resultSet.next()) {
        constraint = resultSet.getString(1);
        String recordType = resultSet.getString(2);
        String recordTableName = resultSet.getString(3);

        if (recordType.equalsIgnoreCase(type) && recordTableName.equalsIgnoreCase(tableName)) {
          found = true;
          break;
        }
      }
    } finally {
      if (resultSet != null) {
        resultSet.close();
      }
    }
    return found ? constraint : null;
  }

  /**
   * {@inheritDoc}
   */
  @Override
  protected void executePreDMLUpdates() throws AmbariException, SQLException {
    executeStackPreDMLUpdates();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  protected void executeDMLUpdates() throws AmbariException, SQLException {
    addNewConfigurationsFromXml();

    // Initialize all default widgets and widget layouts
    initializeClusterAndServiceWidgets();
  }

  /**
   * Adds non NULL constraints and drops outdated columns no longer needed after
   * the column data migration.
   */
  private void cleanupStackUpdates() throws SQLException {
    DESIRED_STACK_ID_COLUMN.setNullable(false);
    CURRENT_STACK_ID_COLUMN.setNullable(false);
    STACK_ID_COLUMN.setNullable(false);

    // make all stack columns NOT NULL now that they are filled in
    dbAccessor.alterColumn(CLUSTERS_TABLE, DESIRED_STACK_ID_COLUMN);
    dbAccessor.alterColumn("hostcomponentdesiredstate", DESIRED_STACK_ID_COLUMN);
    dbAccessor.alterColumn("servicecomponentdesiredstate", DESIRED_STACK_ID_COLUMN);
    dbAccessor.alterColumn("servicedesiredstate", DESIRED_STACK_ID_COLUMN);

    dbAccessor.alterColumn("clusterstate", CURRENT_STACK_ID_COLUMN);
    dbAccessor.alterColumn("hostcomponentstate", CURRENT_STACK_ID_COLUMN);

    dbAccessor.alterColumn("clusterconfig", STACK_ID_COLUMN);
    dbAccessor.alterColumn("serviceconfig", STACK_ID_COLUMN);
    dbAccessor.alterColumn("blueprint", STACK_ID_COLUMN);
    dbAccessor.alterColumn(REPO_VERSION_TABLE, STACK_ID_COLUMN);

    // drop unused JSON columns
    dbAccessor.dropColumn(CLUSTERS_TABLE, DESIRED_STACK_VERSION_COLUMN_NAME);
    dbAccessor.dropColumn("hostcomponentdesiredstate", DESIRED_STACK_VERSION_COLUMN_NAME);
    dbAccessor.dropColumn("servicecomponentdesiredstate", DESIRED_STACK_VERSION_COLUMN_NAME);
    dbAccessor.dropColumn("servicedesiredstate", DESIRED_STACK_VERSION_COLUMN_NAME);

    dbAccessor.dropColumn("clusterstate", CURRENT_STACK_VERSION_COLUMN_NAME);
    dbAccessor.dropColumn("hostcomponentstate", CURRENT_STACK_VERSION_COLUMN_NAME);

    dbAccessor.dropColumn("blueprint", "stack_name");
    dbAccessor.dropColumn("blueprint", "stack_version");

    dbAccessor.dropColumn(REPO_VERSION_TABLE, "stack");
  }
}
