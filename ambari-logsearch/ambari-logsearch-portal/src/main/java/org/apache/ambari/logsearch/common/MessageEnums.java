/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.apache.ambari.logsearch.common;

import org.apache.ambari.logsearch.view.VMessage;

public enum MessageEnums {

  // Common Errors
  DATA_NOT_FOUND("fs.error.data_not_found", "Data not found"), OPER_NOT_ALLOWED_FOR_STATE(
    "fs.error.oper_not_allowed_for_state",
    "Operation not allowed in current state"), OPER_NOT_ALLOWED_FOR_ENTITY(
    "fs.error.oper_not_allowed_for_state",
    "Operation not allowed for entity"), OPER_NO_PERMISSION(
    "fs.error.oper_no_permission",
    "User doesn't have permission to perform this operation"), DATA_NOT_UPDATABLE(
    "fs.error.data_not_updatable", "Data not updatable"), ERROR_CREATING_OBJECT(
    "fs.error.create_object", "Error creating object"), ERROR_DUPLICATE_OBJECT(
    "fs.error.duplicate_object", "Error creating duplicate object"), ERROR_SYSTEM(
    "fs.error.system", "System Error. Please try later."),

  // Common Validations
  INVALID_PASSWORD("fs.validation.invalid_password", "Invalid password"), INVALID_INPUT_DATA(
    "fs.validation.invalid_input_data", "Invalid input data"), NO_INPUT_DATA(
    "fs.validation.no_input_data", "Input data is not provided"), INPUT_DATA_OUT_OF_BOUND(
    "fs.validation.data_out_of_bound", "Input data if out of bound"), NO_NAME(
    "fs.validation.no_name", "Name is not provided"), NO_OR_INVALID_COUNTRY_ID(
    "fs.validation.no_country_id", "Valid Country Id was not provided"), NO_OR_INVALID_CITY_ID(
    "fs.validation.no_city_id", "Valid City Id was not provided"), NO_OR_INVALID_STATE_ID(
    "fs.validation.no_state_id", "Valid State Id was not provided");

  String rbKey;
  String messageDesc;

  MessageEnums(String rbKey, String messageDesc) {
    this.rbKey = rbKey;
    this.messageDesc = messageDesc;
  }

  public VMessage getMessage() {
    VMessage msg = new VMessage();
    msg.setName(this.toString());
    msg.setRbKey(rbKey);
    msg.setMessage(messageDesc);
    return msg;
  }

  public VMessage getMessage(Long objectId, String fieldName) {
    VMessage msg = new VMessage();
    msg.setName(this.toString());
    msg.setRbKey(rbKey);
    msg.setMessage(messageDesc);
    msg.setObjectId(objectId);
    msg.setFieldName(fieldName);
    return msg;
  }
}
