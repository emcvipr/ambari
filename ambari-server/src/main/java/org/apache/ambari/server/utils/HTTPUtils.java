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
package org.apache.ambari.server.utils;

import org.apache.ambari.server.controller.internal.URLStreamProvider;
import org.apache.ambari.server.proxy.ProxyService;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Static Helper methods for HTTP requests.
 */
public class HTTPUtils {

  /**
   * Issues a GET request against a URL.
   * @param urlToRead URL to read from
   * @return Returns a response string if successful, and empty otherwise.
   */
  public static String requestURL(String urlToRead) {
    String result = "";
    BufferedReader rd;
    String line = null;
    String url = urlToRead;

    try {
      URLStreamProvider urlStreamProvider = new URLStreamProvider(ProxyService.URL_CONNECT_TIMEOUT, ProxyService.URL_READ_TIMEOUT, null, null, null);

      Map<String, List<String>> headers = new HashMap<String, List<String>>();

      HttpURLConnection connection = urlStreamProvider.processURL(url, "GET", null, headers);

      int responseCode = connection.getResponseCode();
      InputStream resultInputStream = null;
      if (responseCode >= ProxyService.HTTP_ERROR_RANGE_START) {
        resultInputStream = connection.getErrorStream();
      } else {
        resultInputStream = connection.getInputStream();
      }

      rd = new BufferedReader(new InputStreamReader(resultInputStream));

      if (rd != null) {
        line = rd.readLine();
        while (line != null) {
          result += line;
          line = rd.readLine();
        }
        rd.close();
      }
    } catch (IOException e) {
      e.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return result;
  }
}
