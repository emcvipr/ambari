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

package org.apache.ambari.view.hive.client;

import org.apache.hive.service.auth.HttpAuthUtils;
import org.apache.http.HttpException;
import org.apache.http.HttpRequest;
import org.apache.http.client.CookieStore;
import org.apache.http.protocol.HttpContext;

import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Authentication interceptor which adds Base64 encoded payload,
 * containing the username and kerberos service ticket,
 * to the outgoing http request header.
 */
public class HttpKerberosRequestInterceptor extends HttpRequestInterceptorBase {

  // A fair reentrant lock
  private static ReentrantLock kerberosLock = new ReentrantLock(true);
  String principal;
  String host;
  String serverHttpUrl;
  boolean assumeSubject;

  public HttpKerberosRequestInterceptor(String principal, String host,
      String serverHttpUrl, boolean assumeSubject, CookieStore cs, String cn,
      boolean isSSL, Map<String, String> additionalHeaders) {
    super(cs, cn, isSSL, additionalHeaders);
    this.principal = principal;
    this.host = host;
    this.serverHttpUrl = serverHttpUrl;
    this.assumeSubject = assumeSubject;
  }

  @Override
  protected void addHttpAuthHeader(HttpRequest httpRequest,
    HttpContext httpContext) throws Exception {
	try {
      // Generate the service ticket for sending to the server.
      // Locking ensures the tokens are unique in case of concurrent requests
      kerberosLock.lock();
      String kerberosAuthHeader = HttpAuthUtils.getKerberosServiceTicket(
              principal, host, serverHttpUrl, assumeSubject);
      // Set the session key token (Base64 encoded) in the headers
      httpRequest.addHeader(HttpAuthUtils.AUTHORIZATION + ": " +
        HttpAuthUtils.NEGOTIATE + " ", kerberosAuthHeader);
    } catch (Exception e) {
      throw new HttpException(e.getMessage(), e);
    } finally {
      kerberosLock.unlock();
    }
  }
}