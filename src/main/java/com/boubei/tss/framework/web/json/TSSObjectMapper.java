/* ==================================================================   
 * Created [2009-7-7] by Jon.King 
 * ==================================================================  
 * TSS 
 * ================================================================== 
 * mailTo:boubei@163.com
 * Copyright (c) boubei.com, 2015-2018 
 * ================================================================== 
 */

package com.boubei.tss.framework.web.json;

import java.io.IOException;
import java.util.Date;

import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.JsonSerializer;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializerProvider;
import org.codehaus.jackson.map.ser.CustomSerializerFactory;

import com.boubei.tss.util.DateUtil;
  
/** 
 * 解决Date类型返回json格式为自定义格式 
 */  
public class TSSObjectMapper extends ObjectMapper {  

	public TSSObjectMapper(){  
    	
        CustomSerializerFactory factory = new CustomSerializerFactory();
        
        factory.addGenericMapping(Date.class, new TSSJsonSerializer());  
        
        this.setSerializerFactory(factory);  
    }  
}  

final class TSSJsonSerializer extends JsonSerializer<Date> {
	public void serialize(Date value, JsonGenerator jsonGenerator, SerializerProvider provider)  
	        throws IOException, JsonProcessingException {  
		
	    String result = DateUtil.formatCare2Second(value);
	    result = result.replaceAll(" 00:00:00", "");
		jsonGenerator.writeString( result );  
	}
}