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

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ambari.server.AmbariException;
import org.apache.ambari.server.orm.DBAccessor.DBColumnInfo;
import org.apache.ambari.server.orm.dao.DaoUtils;
import org.apache.ambari.server.orm.dao.PermissionDAO;
import org.apache.ambari.server.orm.dao.ResourceTypeDAO;
import org.apache.ambari.server.orm.entities.PermissionEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Injector;


/**
 * Upgrade catalog for version 2.2.0.
 */
public class UpgradeCatalog220 extends AbstractUpgradeCatalog {
  private static final String HOST_ROLE_COMMAND_TABLE = "host_role_command";
  private static final String USERS_TABLE = "users";

  private static final String HOST_ID_COL = "host_id";
  private static final String USER_TYPE_COL = "user_type";

  private static final String ADMIN_PERMISSION_TABLE = "adminpermission";
  private static final String PERMISSION_ID_COL = "permission_id";
  private static final String PERMISSION_NAME_COL = "permission_name";
  private static final String PERMISSION_LABEL_COL = "permission_label";

  private static final String ROLE_AUTHORIZATION_TABLE = "roleauthorization";
  private static final String PERMISSION_ROLE_AUTHORIZATION_TABLE = "permission_roleauthorization";
  private static final String ROLE_AUTHORIZATION_ID_COL = "authorization_id";
  private static final String ROLE_AUTHORIZATION_NAME_COL = "authorization_name";

  @Inject
  DaoUtils daoUtils;


  /**
   * {@inheritDoc}
   */
  @Override
  public String getSourceVersion() {
    return "2.1.3";
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getTargetVersion() {
    return "2.2.0";
  }

  /**
   * Logger.
   */
  private static final Logger LOG = LoggerFactory.getLogger(UpgradeCatalog220.class);

  // ----- Constructors ------------------------------------------------------

  /**
   * Don't forget to register new UpgradeCatalogs in {@link org.apache.ambari.server.upgrade.SchemaUpgradeHelper.UpgradeHelperModule#configure()}
   * @param injector Guice injector to track dependencies and uses bindings to inject them.
   */
  @Inject
  public UpgradeCatalog220(Injector injector) {
    super(injector);
    this.injector = injector;

    daoUtils = injector.getInstance(DaoUtils.class);
  }

  // ----- AbstractUpgradeCatalog --------------------------------------------

  /**
   * {@inheritDoc}
   */
  @Override
  protected void executeDDLUpdates() throws AmbariException, SQLException {

    dbAccessor.alterColumn(HOST_ROLE_COMMAND_TABLE, new DBColumnInfo(HOST_ID_COL, Long.class, null, null, true));
    dbAccessor.addColumn(USERS_TABLE, new DBColumnInfo(USER_TYPE_COL, String.class, null, "LOCAL", true));

    dbAccessor.executeQuery("UPDATE users SET user_type='LDAP' WHERE ldap_user=1");

    dbAccessor.addUniqueConstraint(USERS_TABLE, "UNQ_users_0", "user_name", "user_type");

    updateAdminPermissionTable();
    createRoleAuthorizationTables();
  }

  @Override
  protected void executePreDMLUpdates() throws AmbariException, SQLException {
  }

  @Override
  protected void executeDMLUpdates() throws AmbariException, SQLException {
    setPermissionLabels();
    updatePermissionNames();
    addNewPermissions();
    createRoleAuthorizations();
    createPermissionRoleAuthorizationMap();
  }

  private void addNewPermissions() throws SQLException {
    LOG.info("Adding new permissions: CLUSTER.OPERATOR, SERVICE.ADMINISTRATOR, SERVICE.OPERATOR");

    PermissionDAO permissionDAO = injector.getInstance(PermissionDAO.class);
    ResourceTypeDAO resourceTypeDAO = injector.getInstance(ResourceTypeDAO.class);
    PermissionEntity permissionEntity = new PermissionEntity();

    // CLUSTER.OPERATOR: Cluster Operator
    permissionEntity.setId(null);
    permissionEntity.setPermissionName("CLUSTER.OPERATOR");
    permissionEntity.setPermissionLabel("Cluster Operator");
    permissionEntity.setResourceType(resourceTypeDAO.findByName("CLUSTER"));
    permissionDAO.create(permissionEntity);

    // SERVICE.ADMINISTRATOR: Service Administrator
    permissionEntity.setId(null);
    permissionEntity.setPermissionName("SERVICE.ADMINISTRATOR");
    permissionEntity.setPermissionLabel("Service Administrator");
    permissionEntity.setResourceType(resourceTypeDAO.findByName("CLUSTER"));
    permissionDAO.create(permissionEntity);

    // SERVICE.OPERATOR: Service Operator
    permissionEntity.setId(null);
    permissionEntity.setPermissionName("SERVICE.OPERATOR");
    permissionEntity.setPermissionLabel("Service Operator");
    permissionEntity.setResourceType(resourceTypeDAO.findByName("CLUSTER"));
    permissionDAO.create(permissionEntity);
  }


  private void createRoleAuthorizations() throws SQLException {
    LOG.info("Adding authorizations");

    String[] columnNames = new String[]{ROLE_AUTHORIZATION_ID_COL, ROLE_AUTHORIZATION_NAME_COL};

    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'VIEW.USE'", "'Use View'"}, false);

    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.VIEW_METRICS'", "'View metrics'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.VIEW_STATUS_INFO'", "'View status information'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.VIEW_CONFIGS'", "'View configurations'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.COMPARE_CONFIGS'", "'Compare configurations'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.VIEW_ALERTS'", "'View service alerts'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.START_STOP'", "'Start/Stop/Restart Service'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.DECOMMISSION_RECOMMISSION'", "'Decommission/recommission'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.RUN_SERVICE_CHECK'", "'Run service checks'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.TOGGLE_MAINTENANCE'", "'Turn on/off maintenance mode'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.RUN_CUSTOM_COMMAND'", "'Perform service-specific tasks'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.MODIFY_CONFIGS'", "'Modify configurations'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.MANAGE_CONFIG_GROUPS'", "'Manage configuration groups'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.MOVE'", "'Move to another host'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.ENABLE_HA'", "'Enable HA'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.TOGGLE_ALERTS'", "'Enable/disable service alerts'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'SERVICE.ADD_DELETE_SERVICES'", "'Add Service to cluster'"}, false);

    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'HOST.VIEW_METRICS'", "'View metrics'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'HOST.VIEW_STATUS_INFO'", "'View status information'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'HOST.VIEW_CONFIGS'", "'View configuration'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'HOST.TOGGLE_MAINTENANCE'", "'Turn on/off maintenance mode'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'HOST.ADD_DELETE_COMPONENTS'", "'Install components'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'HOST.ADD_DELETE_HOSTS'", "'Add/Delete hosts'"}, false);

    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.VIEW_METRICS'", "'View metrics'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.VIEW_STATUS_INFO'", "'View status information'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.VIEW_CONFIGS'", "'View configuration'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.VIEW_STACK_DETAILS'", "'View stack version details'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.VIEW_ALERTS'", "'View alerts'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.MANAGE_CREDENTIALS'", "'Manage external credentials'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.TOGGLE_ALERTS'", "'Enable/disable alerts'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.TOGGLE_KERBEROS'", "'Enable/disable Kerberos'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'CLUSTER.UPGRADE_DOWNGRADE_STACK'", "'Upgrade/downgrade stack'"}, false);

    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.ADD_DELETE_CLUSTERS'", "'Create new clusters'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.SET_SERVICE_USERS_GROUPS'", "'Set service users and groups'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.RENAME_CLUSTER'", "'Rename clusters'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.MANAGE_USERS'", "'Manage users'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.MANAGE_GROUPS'", "'Manage groups'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.MANAGE_VIEWS'", "'Manage Ambari Views'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.ASSIGN_ROLES'", "'Assign roles'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.MANAGE_STACK_VERSIONS'", "'Manage stack versions'"}, false);
    dbAccessor.insertRow(ROLE_AUTHORIZATION_TABLE, columnNames, new String[]{"'AMBARI.EDIT_STACK_REPOS'", "'Edit stack repository URLs'"}, false);
  }

  private void createPermissionRoleAuthorizationMap() throws SQLException {
    LOG.info("Creating permission to authorizations map");

    String[] columnNames = new String[] {PERMISSION_ID_COL, ROLE_AUTHORIZATION_ID_COL};

    // Determine the role Ids"
    PermissionDAO permissionDAO = injector.getInstance(PermissionDAO.class);
    ResourceTypeDAO resourceTypeDAO = injector.getInstance(ResourceTypeDAO.class);

    String viewPermissionId = permissionDAO.findPermissionByNameAndType("VIEW.USER", resourceTypeDAO.findByName("VIEW")).getId().toString();
    String administratorPermissionId = permissionDAO.findPermissionByNameAndType("AMBARI.ADMINISTRATOR", resourceTypeDAO.findByName("AMBARI")).getId().toString();
    String clusterUserPermissionId = permissionDAO.findPermissionByNameAndType("CLUSTER.USER", resourceTypeDAO.findByName("CLUSTER")).getId().toString();
    String clusterOperatorPermissionId = permissionDAO.findPermissionByNameAndType("CLUSTER.OPERATOR", resourceTypeDAO.findByName("CLUSTER")).getId().toString();
    String clusterAdministratorPermissionId = permissionDAO.findPermissionByNameAndType("CLUSTER.ADMINISTRATOR", resourceTypeDAO.findByName("CLUSTER")).getId().toString();
    String serviceAdministratorPermissionId = permissionDAO.findPermissionByNameAndType("SERVICE.ADMINISTRATOR", resourceTypeDAO.findByName("CLUSTER")).getId().toString();
    String serviceOperatorPermissionId = permissionDAO.findPermissionByNameAndType("SERVICE.OPERATOR", resourceTypeDAO.findByName("CLUSTER")).getId().toString();

    // Create role groups
    List<String> viewUserOnly = Arrays.asList(viewPermissionId);
    List<String> clusterUserAndUp = Arrays.asList(
        clusterUserPermissionId,
        serviceOperatorPermissionId,
        serviceAdministratorPermissionId,
        clusterOperatorPermissionId,
        clusterAdministratorPermissionId,
        administratorPermissionId);
    List<String> serviceOperatorAndUp = Arrays.asList(
        serviceOperatorPermissionId,
        serviceAdministratorPermissionId,
        clusterOperatorPermissionId,
        clusterAdministratorPermissionId,
        administratorPermissionId);
    List<String> serviceAdministratorAndUp = Arrays.asList(
        serviceAdministratorPermissionId,
        clusterOperatorPermissionId,
        clusterAdministratorPermissionId,
        administratorPermissionId);
    List<String> clusterOperatorAndUp = Arrays.asList(
        clusterOperatorPermissionId,
        clusterAdministratorPermissionId,
        administratorPermissionId);
    List<String> clusterAdministratorAndUp = Arrays.asList(
        clusterAdministratorPermissionId,
        administratorPermissionId);
    List<String> administratorOnly = Arrays.asList(administratorPermissionId);

    // A map of the authorizations to the relevant roles
    Map<String, List<String>> map = new HashMap<String, List<String>>();
    map.put("VIEW.USE", viewUserOnly);
    map.put("SERVICE.VIEW_METRICS", clusterUserAndUp);
    map.put("SERVICE.VIEW_STATUS_INFO", clusterUserAndUp);
    map.put("SERVICE.VIEW_CONFIGS", clusterUserAndUp);
    map.put("SERVICE.COMPARE_CONFIGS", clusterUserAndUp);
    map.put("SERVICE.VIEW_ALERTS", clusterUserAndUp);
    map.put("SERVICE.START_STOP", serviceOperatorAndUp);
    map.put("SERVICE.DECOMMISSION_RECOMMISSION", serviceOperatorAndUp);
    map.put("SERVICE.RUN_SERVICE_CHECK", serviceOperatorAndUp);
    map.put("SERVICE.TOGGLE_MAINTENANCE", serviceOperatorAndUp);
    map.put("SERVICE.RUN_CUSTOM_COMMAND", serviceOperatorAndUp);
    map.put("SERVICE.MODIFY_CONFIGS", serviceAdministratorAndUp);
    map.put("SERVICE.MANAGE_CONFIG_GROUPS", serviceAdministratorAndUp);
    map.put("SERVICE.MOVE", serviceAdministratorAndUp);
    map.put("SERVICE.ENABLE_HA", serviceAdministratorAndUp);
    map.put("SERVICE.TOGGLE_ALERTS", serviceAdministratorAndUp);
    map.put("SERVICE.ADD_DELETE_SERVICES", clusterAdministratorAndUp);
    map.put("HOST.VIEW_METRICS",clusterUserAndUp);
    map.put("HOST.VIEW_STATUS_INFO", clusterUserAndUp);
    map.put("HOST.VIEW_CONFIGS", clusterUserAndUp);
    map.put("HOST.TOGGLE_MAINTENANCE", clusterOperatorAndUp);
    map.put("HOST.ADD_DELETE_COMPONENTS", clusterOperatorAndUp);
    map.put("HOST.ADD_DELETE_HOSTS", clusterOperatorAndUp);
    map.put("CLUSTER.VIEW_METRICS", clusterUserAndUp);
    map.put("CLUSTER.VIEW_STATUS_INFO", clusterUserAndUp);
    map.put("CLUSTER.VIEW_CONFIGS", clusterUserAndUp);
    map.put("CLUSTER.VIEW_STACK_DETAILS", clusterUserAndUp);
    map.put("CLUSTER.VIEW_ALERTS", clusterUserAndUp);
    map.put("CLUSTER.MANAGE_CREDENTIALS", clusterAdministratorAndUp);
    map.put("CLUSTER.TOGGLE_ALERTS", clusterAdministratorAndUp);
    map.put("CLUSTER.TOGGLE_KERBEROS", clusterAdministratorAndUp);
    map.put("CLUSTER.UPGRADE_DOWNGRADE_STACK", clusterAdministratorAndUp);
    map.put("AMBARI.ADD_DELETE_CLUSTERS", administratorOnly);
    map.put("AMBARI.SET_SERVICE_USERS_GROUPS", administratorOnly);
    map.put("AMBARI.RENAME_CLUSTER", administratorOnly);
    map.put("AMBARI.MANAGE_USERS", administratorOnly);
    map.put("AMBARI.MANAGE_GROUPS", administratorOnly);
    map.put("AMBARI.MANAGE_VIEWS", administratorOnly);
    map.put("AMBARI.ASSIGN_ROLES", administratorOnly);
    map.put("AMBARI.MANAGE_STACK_VERSIONS", administratorOnly);
    map.put("AMBARI.EDIT_STACK_REPOS", administratorOnly);

    // Iterate over the map of authorizations to role to find the set of roles to map to each
    // authorization and then add the relevant record
    for(Map.Entry<String,List<String>> entry: map.entrySet()) {
      String authorizationId = entry.getKey();

      for(String permissionId : entry.getValue()) {
        dbAccessor.insertRow(PERMISSION_ROLE_AUTHORIZATION_TABLE, columnNames,
            new String[]{permissionId, "'" + authorizationId + "'"}, false);
      }
    }
  }


  // ----- UpgradeCatalog ----------------------------------------------------

  private void updateAdminPermissionTable() throws SQLException {
    // Add the permission_label column to the adminpermission table
    dbAccessor.addColumn(ADMIN_PERMISSION_TABLE, new DBColumnInfo(PERMISSION_LABEL_COL, String.class, 255, null, true));
  }

  private void createRoleAuthorizationTables() throws SQLException {

    ArrayList<DBColumnInfo> columns;

    //  Add roleauthorization table
    LOG.info("Creating " + ROLE_AUTHORIZATION_TABLE + " table");
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo(ROLE_AUTHORIZATION_ID_COL, String.class, 100, null, false));
    columns.add(new DBColumnInfo(ROLE_AUTHORIZATION_NAME_COL, String.class, 255, null, false));
    dbAccessor.createTable(ROLE_AUTHORIZATION_TABLE, columns, ROLE_AUTHORIZATION_ID_COL);

    //  Add permission_roleauthorization table to map roleauthorizations to permissions (aka roles)
    LOG.info("Creating " + PERMISSION_ROLE_AUTHORIZATION_TABLE + " table");
    columns = new ArrayList<DBColumnInfo>();
    columns.add(new DBColumnInfo(PERMISSION_ID_COL, Long.class, null, null, false));
    columns.add(new DBColumnInfo(ROLE_AUTHORIZATION_ID_COL, String.class, 100, null, false));
    dbAccessor.createTable(PERMISSION_ROLE_AUTHORIZATION_TABLE, columns, PERMISSION_ID_COL, ROLE_AUTHORIZATION_ID_COL);

    dbAccessor.addFKConstraint(PERMISSION_ROLE_AUTHORIZATION_TABLE, "FK_permission_roleauth_pid",
        PERMISSION_ID_COL, ADMIN_PERMISSION_TABLE, PERMISSION_ID_COL, false);

    dbAccessor.addFKConstraint(PERMISSION_ROLE_AUTHORIZATION_TABLE, "FK_permission_roleauth_aid",
        ROLE_AUTHORIZATION_ID_COL, ROLE_AUTHORIZATION_TABLE, ROLE_AUTHORIZATION_ID_COL, false);
  }

  private void setPermissionLabels() throws SQLException {
    String updateStatement = "UPDATE " + ADMIN_PERMISSION_TABLE + " SET " + PERMISSION_LABEL_COL + "='%s' WHERE " + PERMISSION_ID_COL + "=%d";

    LOG.info("Setting permission labels");
    dbAccessor.executeUpdate(String.format(updateStatement,
        "Administrator", PermissionEntity.AMBARI_ADMINISTRATOR_PERMISSION));
    dbAccessor.executeUpdate(String.format(updateStatement,
        "Cluster User", PermissionEntity.CLUSTER_USER_PERMISSION));
    dbAccessor.executeUpdate(String.format(updateStatement,
        "Cluster Administrator", PermissionEntity.CLUSTER_ADMINISTRATOR_PERMISSION));
    dbAccessor.executeUpdate(String.format(updateStatement,
        "View User", PermissionEntity.VIEW_USER_PERMISSION));
  }

  private void updatePermissionNames() throws SQLException {
    String updateStatement = "UPDATE " + ADMIN_PERMISSION_TABLE + " SET " + PERMISSION_NAME_COL + "='%s' WHERE " + PERMISSION_ID_COL + "=%d";

    // Update permissions names
    LOG.info("Updating permission names");
    dbAccessor.executeUpdate(String.format(updateStatement,
        PermissionEntity.AMBARI_ADMINISTRATOR_PERMISSION_NAME, PermissionEntity.AMBARI_ADMINISTRATOR_PERMISSION));
    dbAccessor.executeUpdate(String.format(updateStatement,
        PermissionEntity.CLUSTER_USER_PERMISSION_NAME, PermissionEntity.CLUSTER_USER_PERMISSION));
    dbAccessor.executeUpdate(String.format(updateStatement,
        PermissionEntity.CLUSTER_ADMINISTRATOR_PERMISSION_NAME, PermissionEntity.CLUSTER_ADMINISTRATOR_PERMISSION));
    dbAccessor.executeUpdate(String.format(updateStatement,
        PermissionEntity.VIEW_USER_PERMISSION_NAME, PermissionEntity.VIEW_USER_PERMISSION));
  }

}
