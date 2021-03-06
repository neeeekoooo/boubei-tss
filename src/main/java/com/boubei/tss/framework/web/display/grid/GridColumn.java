/* ==================================================================   
 * Created [2009-7-7] by Jon.King 
 * ==================================================================  
 * TSS 
 * ================================================================== 
 * mailTo:boubei@163.com
 * Copyright (c) boubei.com, 2015-2018 
 * ================================================================== 
 */

package com.boubei.tss.framework.web.display.grid;

import com.boubei.tss.util.EasyUtils;

/** 
 * 对grid的Column的封装对象。
 * 一个GridColumn是一列，一个GridNode是一行
 */
class GridColumn {
    
	static final String GRID_COLUMN_MODE_STRING  = "string";
	static final String GRID_COLUMN_MODE_NUMBER  = "number";
	static final String GRID_COLUMN_MODE_DATE    = "date";

	private String name;     // 列名称
	private String mode;     // 数据类型，如果为空则认为是string
	private String pattern;  // 数据格式化格式，如果为空则不格式化数据

	public String getMode() {
		return mode;
	}

	public String getName() {
		return name;
	}

	public String getPattern() {
		return pattern;
	}

	public void setMode(String mode) {
		if (  EasyUtils.isNullOrEmpty(mode) ) {
			mode = GRID_COLUMN_MODE_STRING;
		}
		this.mode = mode;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setPattern(String pattern) {
		this.pattern = pattern;
	}
}
