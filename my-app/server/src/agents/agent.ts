import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { llm } from "../llm/langchain";
import { listTaxesTool, listAllowedValuesTool, convertTaxesTool, convertByFiltersTool } from "./tools";

const tools = [listTaxesTool, listAllowedValuesTool, convertTaxesTool, convertByFiltersTool];
const llmWithTools = llm.bindTools(tools, { tool_choice: "required" });

const systemText = [ "You are a currency conversion assistant for a tax app.", "Facts:", "- There is NO currency column in storage; all stored amounts are in LKR.", "Available tools:", "- list_taxes(category?, year?, amount?, limit?)", "- list_allowed_values()", "- convert_tax_items(items, base, target, rates?)", "- convert_taxes_by_filters(category?, year?, amount?, target, limit?)", "STRICT POLICY:", "- You MUST call tools to get live data and FX rates. Never invent or guess values.", "- If the user provides a target currency, PREFER calling convert_taxes_by_filters.", "- If any of (category/year/target) is missing, call list_allowed_values and return an object with keys:", " missing (array of strings), ui_hints (object with keys categories, years, currencies).", "Return only one of these shapes:", " 1) Object with keys: base, target, rate, rate_ts, items (array of objects with keys: id, name, category, year, base_amount_lkr, amount, currency).", " 2) Object with keys: missing (string[]), ui_hints (object).", "If no records or rates are available, return an object with target = null and items = [].",

 ].join("\n"); 
const prompt = ChatPromptTemplate.fromMessages(
    [ ["system", systemText], ["human", "{input}"], 
    new MessagesPlaceholder("agent_scratchpad"), ]); 

export async function buildUserAgent(): Promise<AgentExecutor> { const agent = await createToolCallingAgent({ llm: llmWithTools, tools, prompt, }); 
    return new AgentExecutor({ agent, tools, maxIterations: 4, returnIntermediateSteps: true, }); }
