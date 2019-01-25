package com.boubei.tssx.ali;

import java.util.Date;
import java.util.List;
import java.util.Map;

import com.boubei.tss.framework.Global;
import com.boubei.tss.framework.persistence.ICommonDao;
import com.boubei.tss.modules.cloud.entity.CloudOrder;
import com.boubei.tss.um.entity.User;
import com.boubei.tss.util.EasyUtils;

public abstract class AbstractAfterPay implements IAfterPay {

	protected static ICommonDao commonDao = (ICommonDao) Global.getBean("CommonDao");

	public CloudOrder co;
	public Long userId;
	public Map<?, ?> trade_map;
	public String payType;

	public AbstractAfterPay() {

	}

	public AbstractAfterPay(CloudOrder co) {
		this.co = co;
	}

	public static AbstractAfterPay createBean(String out_trade_no) {
		String cloudOrderId = out_trade_no.split("-")[1];
		if (EasyUtils.isNullOrEmpty(cloudOrderId)) {
			return null;
		}
		CloudOrder co = (CloudOrder) commonDao.getEntity(CloudOrder.class, EasyUtils.obj2Long(cloudOrderId));
		String type = co.getType();
		if (CloudOrder.TYPE0.equals(type)) {
			return new ProductModule(co);
		}
		if (CloudOrder.TYPE1.equals(type)) {
			return new ProductRecharge(co);
		}
		return null;
	}

	public Object handle(Map<?, ?> trade_map, String payType) {
		this.trade_map = trade_map;
		this.payType = payType;
		Double receipt_amount = EasyUtils.obj2Double(trade_map.get("receipt_amount"));
		@SuppressWarnings("unchecked")
		List<User> users = (List<User>) commonDao.getEntities(" from User where loginName = ?", co.getCreator());
		this.userId = users.get(0).getId();

		if (!CloudOrder.NEW.equals(co.getStatus())) {
			// throw new BusinessException("订单已支付");
			return "订单" + co.getStatus();
		}

		if (!receipt_amount.equals(co.getMoney_cal())) {
			return "订单金额不符";
		}
		co.setMoney_real(receipt_amount);
		co.setPay_date(new Date());
		co.setStatus(CloudOrder.PAYED);
		commonDao.update(co);
		if (handle()) {
			return "success";
		}
		return "false";

	}

	public abstract Boolean handle();

}