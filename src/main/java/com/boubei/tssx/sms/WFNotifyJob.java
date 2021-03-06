package com.boubei.tssx.sms;

import java.util.List;
import java.util.Map;

import com.boubei.tss.dm.dml.SQLExcutor;
import com.boubei.tss.modules.param.ParamManager;
import com.boubei.tss.modules.timer.AbstractJob;
import com.boubei.tss.util.EasyUtils;

/**
 * com.boubei.tssx.sms.WFNotifyJob | 0 0 9 * * ? | X
 */
public class WFNotifyJob extends AbstractJob {
	
	protected boolean needSuccessLog() {
		return true;
	}

	protected String excuteJob(String jobConfig, Long jobID) {
		String sysName = ParamManager.getValue("sysTitle", "它山石");
		String approveNodify = ParamManager.getValue("approveNodify", "SMS_138068571");
		String rejectNodify  = ParamManager.getValue("rejectNodify", "SMS_147436558");
		
		String waitSql = "select u.telephone, u.userName, count(*) num from dm_workflow_status t, um_user u" +
				" where t.nextProcessor = u.loginName and u.telephone is not null and IFNULL(lastProcessTime, applyTime) >= DATE_SUB(NOW(), INTERVAL 48 hour) " +
				" group by nextProcessor ";
		String rejectSql = "select  u.telephone, u.userName, count(*) num,group_concat( distinct tableName separator ',' ) wflist " +
				" from dm_workflow_status t, um_user u" +
				" where t.applier = u.loginName and u.telephone is not null and currentStatus = '已驳回' and lastProcessTime >= DATE_SUB(NOW(), INTERVAL 24 hour)" +
				" group by applier ";
		
		List<Map<String, Object>> waitList = SQLExcutor.queryL(waitSql);
		for(Map<String, Object> row : waitList ) {
			String phone = (String) row.remove("telephone");
			row.put("sysName", sysName);
			row.put("userName", row.remove("username"));
			
			String tlParam = EasyUtils.obj2Json(row);
			AliyunSMS.instance().send(phone, approveNodify, tlParam, -1);
		}
		
		List<Map<String, Object>> rejectList = SQLExcutor.queryL(rejectSql);
		for(Map<String, Object> row : rejectList ) {
			String phone = (String) row.remove("telephone");
			row.put("sysName", sysName);
			row.put("userName", row.remove("username"));
			row.put("wflist", row.remove("wflist"));
			
			String tlParam = EasyUtils.obj2Json(row);
			AliyunSMS.instance().send(phone, rejectNodify, tlParam, -1);
		}
		
		return "共发送" + (waitList.size() + rejectList.size()) + "条流程提醒，其中驳回提醒 " +rejectList.size()+ "条";
	}

}
