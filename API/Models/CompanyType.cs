using System.ComponentModel;

namespace API.Models;

public enum CompanyType
{
    [Description("ЕТ - Едноличен търговец")]
    SoleProprietorship,
    
    [Description("ООД - Дружество с ограничена отговорност")]
    LLC,
    
    [Description("ЕООД - Еднолично дружество с ограничена отговорност")]
    LTD,
    
    [Description("АД - Акционерно дружество")]
    JSC,
    
    [Description("СД - Събирателно дружество")]
    Partnership,
    
    [Description("КД - Командитно дружество")]
    LimitedPartnership,
    
    [Description("Кооперация")]
    Cooperative,
    
    [Description("Друго")]
    Other
}