import { formatValue } from "../lib/utils";

export function getReliabilityMessage(data: any) {
    const reliability = data.reliability_score * 100;
    
    if (reliability > 100 || reliability < 0) {
      return `Initial data, it may take few minutes to callibrate`;
    } 
    return formatValue(data.reliability_score, "reliability_score");
  }