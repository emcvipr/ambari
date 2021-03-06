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

package org.apache.ambari.logsearch.util;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ambari.logsearch.common.MessageEnums;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.codehaus.jackson.type.TypeReference;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Component
public class JSONUtil {

  static Logger logger = Logger.getLogger(JSONUtil.class);

  @Autowired
  RESTErrorUtil restErrorUtil;

  @Autowired
  StringUtil stringUtil;

  public final static String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss.SSS";
  Gson gson = new GsonBuilder().setDateFormat(DATE_FORMAT).create();

  // Conversion from JSONArray to List<String>
  public static List<String> JSONToList(JSONArray jarray)
    throws JSONException {
    ArrayList<String> list = new ArrayList<String>();
    JSONArray jsonArray = jarray;
    if (jsonArray != null) {
      int len = jsonArray.length();
      for (int i = 0; i < len; i++) {
        list.add(jsonArray.get(i).toString());
      }
    }
    return list;
  }

  @SuppressWarnings("unchecked")
  public HashMap<String, String> jsonToMap(String jsonStr) {
    if (stringUtil.isEmpty(jsonStr)) {
      logger.info("jsonString is empty, cannot conver to map");
      return null;
    }
    ObjectMapper mapper = new ObjectMapper();
    try {
      Object tempObject = mapper.readValue(jsonStr,
        new TypeReference<HashMap<String, String>>() {
        });
      return (HashMap<String, String>) tempObject;

    } catch (JsonParseException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    } catch (JsonMappingException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    } catch (IOException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    }

  }

  @SuppressWarnings("unchecked")
  public HashMap<String, Object> jsonToMapObject(String jsonStr) {
    if (stringUtil.isEmpty(jsonStr)) {
      logger.info("jsonString is empty, cannot conver to map");
      return null;
    }
    ObjectMapper mapper = new ObjectMapper();
    try {
      Object tempObject = mapper.readValue(jsonStr,
        new TypeReference<HashMap<String, Object>>() {
        });
      return (HashMap<String, Object>) tempObject;

    } catch (JsonParseException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    } catch (JsonMappingException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    } catch (IOException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    }

  }

  @SuppressWarnings("unchecked")
  public List<HashMap<String, Object>> jsonToMapObjectList(String jsonStr) {
    ObjectMapper mapper = new ObjectMapper();
    try {
      Object tempObject = mapper.readValue(jsonStr,
        new TypeReference<List<HashMap<String, Object>>>() {
        });
      return (List<HashMap<String, Object>>) tempObject;

    } catch (JsonParseException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    } catch (JsonMappingException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    } catch (IOException e) {
      throw restErrorUtil.createRESTException(
        "Invalid input data: " + e.getMessage(),
        MessageEnums.INVALID_INPUT_DATA);
    }

  }

  public boolean isJSONValid(String jsonString) {
    try {
      new JSONObject(jsonString);
    } catch (JSONException ex) {
      try {
        new JSONArray(jsonString);
      } catch (JSONException ex1) {
        return false;
      }
    }
    return true;
  }

  /**
   * @param fileName
   * @return
   */
  public HashMap<String, Object> readJsonFromFile(File jsonFile) {
    ObjectMapper mapper = new ObjectMapper();
    try {
      HashMap<String, Object> jsonmap = mapper.readValue(jsonFile,
        new TypeReference<HashMap<String, Object>>() {
        });
      return jsonmap;
    } catch (JsonParseException e) {
      logger.error(e, e.getCause());
    } catch (JsonMappingException e) {
      logger.error(e, e.getCause());
    } catch (IOException e) {
      logger.error(e, e.getCause());
    }
    return new HashMap<String, Object>();
  }

  public String mapToJSON(Map<String, Object> map) {
    ObjectMapper om = new ObjectMapper();
    try {
      String json = om.writeValueAsString(map);

      return json;
    } catch (JsonGenerationException e) {
      logger.error(e, e.getCause());
    } catch (JsonMappingException e) {
      logger.error(e, e.getCause());
    } catch (IOException e) {
      logger.error(e, e.getCause());
    }
    return "";
  }

  /**
   * WRITE JOSN IN FILE ( Delete existing file and create new file)
   *
   * @param jsonStr
   * @param outputFile
   * @param beautify
   */
  public void writeJSONInFile(String jsonStr, File outputFile,
                              boolean beautify) {
    FileWriter fileWriter = null;
    if (outputFile == null) {
      logger.error("user_pass json file can't be null.");
      return;
    }
    try {
      boolean writePermission = false;
      if (outputFile.exists() && outputFile.canWrite()) {
        writePermission = true;
      }
      if (writePermission) {
        fileWriter = new FileWriter(outputFile);
        if (beautify) {
          ObjectMapper mapper = new ObjectMapper();
          Object json = mapper.readValue(jsonStr, Object.class);
          jsonStr = mapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(json);
        }
        fileWriter.write(jsonStr);
      } else {
        logger.error("Applcation does not have permission to update file to write enc_password. file="
          + outputFile.getAbsolutePath());
      }
    } catch (IOException e) {
      logger.error("Error writing to password file.", e.getCause());
    } finally {
      if (fileWriter != null) {
        try {
          fileWriter.flush();
          fileWriter.close();
        } catch (Exception exception) {
          // ignore
          logger.error(exception);
        }
      }
    }
  }

  public String objToJson(Object obj) {
    return gson.toJson(obj);
  }

  public Object jsonToObj(String json, Class<?> klass) {
    return gson.fromJson(json, klass);
  }
}