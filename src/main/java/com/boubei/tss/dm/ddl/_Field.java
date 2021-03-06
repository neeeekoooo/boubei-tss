/* ==================================================================   
 * Created [2016-3-5] by Jon.King 
 * ==================================================================  
 * TSS 
 * ================================================================== 
 * mailTo:boubei@163.com
 * Copyright (c) boubei.com, 2015-2018 
 * ================================================================== 
 */

package com.boubei.tss.dm.ddl;

import java.util.Map;

import com.boubei.tss.util.EasyUtils;

public class _Field {
	
	public static String STRICT_QUERY = "strictQuery";
	
	// 字段类型
	public static String TYPE_STRING   = "string";
	public static String TYPE_NUMBER   = "number";
	public static String TYPE_INT      = "int";
	public static String TYPE_DATE     = "date";
	public static String TYPE_DATETIME = "datetime";
	public static String TYPE_FILE 	   = "file";
	public static String TYPE_HIDDEN   = "hidden";
	
	public static String COLUMN = "f";
	
	public final static String SNO_xxxx = "xxxx"; // 取号器格式1
	public final static String SNO_yyMMddxxxx = "yyMMddxxxx".toLowerCase(); // 取号器格式2

	/**
	 * 字符串的类型字段的长度 = height/18 *255
	 */
	public static int getVarcharLength(Map<Object, Object> fDefs) {
		int length = 255;
		
		String _height = (String) fDefs.get("height");
		if( !EasyUtils.isNullOrEmpty(_height) ) {
			length = Math.max(1, Integer.parseInt(_height.replace("px", ""))/18) * 255;
		}
		
		return length;
	}
	
	public static boolean isAutoSN(String defaultVal) {
		String val = (defaultVal+"").toLowerCase().trim();
		return val.endsWith(SNO_yyMMddxxxx.toLowerCase()) || val.endsWith(SNO_xxxx);
	}
}
