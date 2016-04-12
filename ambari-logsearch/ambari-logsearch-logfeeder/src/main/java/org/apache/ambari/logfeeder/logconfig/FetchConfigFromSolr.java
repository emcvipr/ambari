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

package org.apache.ambari.logfeeder.logconfig;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;

import org.apache.ambari.logfeeder.LogFeederUtil;
import org.apache.ambari.logfeeder.util.SolrUtil;
import org.apache.ambari.logfeeder.view.VLogfeederFilter;
import org.apache.ambari.logfeeder.view.VLogfeederFilterWrapper;
import org.apache.log4j.Logger;

public class FetchConfigFromSolr extends Thread {
  private static Logger logger = Logger.getLogger(FetchConfigFromSolr.class);
  private static VLogfeederFilterWrapper logfeederFilterWrapper = null;
  private static int solrConfigInterval = 5;// 5 sec;
  private static long delay;
  private static String endTimeDateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS";//2016-04-05T04:30:00.000Z
  private static String sysTimeZone = "GMT";

  public FetchConfigFromSolr() {
    this.setName(this.getClass().getSimpleName());
  }

  @Override
  public void run() {
    solrConfigInterval = LogFeederUtil.getIntProperty("logfeeder.solr.config.internal", solrConfigInterval);
    delay = 1000 * solrConfigInterval;
    do {
      logger.debug("Updating config from solr after every " + solrConfigInterval + " sec.");
      pullConfigFromSolr();
      try {
        Thread.sleep(delay);
      } catch (InterruptedException e) {
        logger.error(e.getLocalizedMessage(), e.getCause());
      }
    } while (true);
  }

  private synchronized void pullConfigFromSolr() {
    HashMap<String, Object> configDocMap = SolrUtil.getInstance().getConfigDoc();
    if (configDocMap != null) {
      String configJson = (String) configDocMap.get(LogFeederConstants.VALUES);
      if (configJson != null) {
        logfeederFilterWrapper = LogFeederUtil.getGson().fromJson(configJson, VLogfeederFilterWrapper.class);
      }
    }
  }

  public static boolean isFilterExpired(VLogfeederFilter logfeederFilter) {
    boolean isFilterExpired = false;// default is false
    if (logfeederFilter != null) {
      Date filterEndDate = parseFilterExpireDate(logfeederFilter);
      if (filterEndDate != null) {
        Date currentDate = getCurrentDate();
        if (currentDate.compareTo(filterEndDate) >= 0) {
          logger.debug("Filter for  Component :" + logfeederFilter.getLabel() + " and Hosts :"
            + listToStr(logfeederFilter.getHosts()) + "Filter is expired because of filter endTime : "
            + dateToStr(filterEndDate) + " is older than currentTime :" + dateToStr(currentDate));
          isFilterExpired = true;
        }
      }
    }
    return isFilterExpired;
  }

  public static String dateToStr(Date date) {
    if (date == null) {
      return "";
    }
    SimpleDateFormat formatter = new SimpleDateFormat(endTimeDateFormat);
    TimeZone timeZone = TimeZone.getTimeZone(sysTimeZone);
    formatter.setTimeZone(timeZone);
    return formatter.format(date);
  }

  public static Date parseFilterExpireDate(VLogfeederFilter vLogfeederFilter) {
    String expiryTime = vLogfeederFilter.getExpiryTime();
    if (expiryTime != null && !expiryTime.isEmpty()) {
      SimpleDateFormat formatter = new SimpleDateFormat(endTimeDateFormat);
      TimeZone timeZone = TimeZone.getTimeZone(sysTimeZone);
      formatter.setTimeZone(timeZone);
      try {
        return formatter.parse(expiryTime);
      } catch (ParseException e) {
        logger.error("Filter have invalid ExpiryTime : " + expiryTime + " for component :" + vLogfeederFilter.getLabel()
          + " and hosts :" + listToStr(vLogfeederFilter.getHosts()));
      }
    }
    return null;
  }

  public static List<String> getAllowedLevels(String hostName, VLogfeederFilter componentFilter) {
    String componentName = componentFilter.getLabel();
    List<String> hosts = componentFilter.getHosts();
    List<String> defaultLevels = componentFilter.getDefaultLevels();
    List<String> overrideLevels = componentFilter.getOverrideLevels();
    if (LogFeederUtil.isListContains(hosts, hostName, false)) {
      if (isFilterExpired(componentFilter)) {
        // pick default
        logger.debug("Filter for component " + componentName + " and host :" + hostName + " is expired at "
          + componentFilter.getExpiryTime());
        return defaultLevels;
      } else {
        // return tmp filter levels
        return overrideLevels;
      }
    } else {
      return defaultLevels;
    }
  }

  public static VLogfeederFilter findComponentFilter(String componentName) {
    if (logfeederFilterWrapper != null) {
      HashMap<String, VLogfeederFilter> filter = logfeederFilterWrapper.getFilter();
      if (filter != null) {
        VLogfeederFilter componentFilter = filter.get(componentName);
        if (componentFilter != null) {
          return componentFilter;
        }
      }
    }
    logger.trace("Filter is not there for component :" + componentName);
    return null;
  }


  public static Date getCurrentDate() {
    TimeZone.setDefault(TimeZone.getTimeZone(sysTimeZone));
    Date date = new Date();
    return date;
  }

  public static String listToStr(List<String> strList) {
    StringBuilder out = new StringBuilder("[");
    if (strList != null) {
      int counter = 0;
      for (Object o : strList) {
        if (counter > 0) {
          out.append(",");
        }
        out.append(o.toString());
        counter++;
      }
    }
    out.append("]");
    return out.toString();
  }
}
