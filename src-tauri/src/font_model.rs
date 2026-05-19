use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScannedFont {
    pub id: String,
    pub name: String,
    pub family: String,
    pub style: String,
    pub source: String,
    pub path: String,
    pub format: String,
    pub file_size: String,
}
