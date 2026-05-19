use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FontWeightRange {
    pub min: u16,
    pub default: u16,
    pub max: u16,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScannedFont {
    pub id: String,
    pub name: String,
    pub name_source: String,
    pub family: String,
    pub style: String,
    pub source: String,
    pub path: String,
    pub file_name: String,
    pub format: String,
    pub file_size: String,
    pub is_variable: bool,
    pub weight_class: u16,
    pub available_weights: Vec<u16>,
    pub variable_weight_range: Option<FontWeightRange>,
    pub version: String,
    pub vendor: String,
    pub copyright: String,
}
