/// Converts Unicode box-drawing characters to svgbob-compatible ASCII equivalents.
fn normalize_box_drawing(input: &str) -> String {
    input
        .replace('─', "-")
        .replace('│', "|")
        .replace('┌', "+")
        .replace('┐', "+")
        .replace('└', "+")
        .replace('┘', "+")
        .replace('├', "+")
        .replace('┤', "+")
        .replace('┬', "+")
        .replace('┴', "+")
        .replace('┼', "+")
        .replace('╭', "+")
        .replace('╮', "+")
        .replace('╰', "+")
        .replace('╯', "+")
        .replace('═', "-")
        .replace('║', "|")
        .replace('╔', "+")
        .replace('╗', "+")
        .replace('╚', "+")
        .replace('╝', "+")
        .replace('╠', "+")
        .replace('╣', "+")
        .replace('╦', "+")
        .replace('╩', "+")
        .replace('╬', "+")
        // Tree-drawing characters
        .replace('┊', ":")
        .replace('┆', ":")
}

/// Rewrites svgbob's embedded light-mode styles to dark-mode colors.
fn apply_dark_theme(svg: &str) -> String {
    svg // Strokes and lines
        .replace("stroke: black;", "stroke: #a9b1d6;")
        // Text fill
        .replace("fill: black;", "fill: #c0caf5;")
        // White backdrop → transparent (let CSS background show through)
        .replace("fill: white;", "fill: transparent;")
        // Filled markers (arrows, diamonds) should use the stroke color
        .replace(".filled {\n  fill: black;", ".filled {\n  fill: #a9b1d6;")
        // Compressed variant (svgbob_compressed output uses single-line styles)
        .replace(".filled{fill:black;", ".filled{fill:#a9b1d6;")
}

/// Rewrites svgbob's embedded styles for light-mode (Glacier theme).
fn apply_light_theme(svg: &str) -> String {
    svg // Strokes and lines
        .replace("stroke: black;", "stroke: #3b4252;")
        // Text fill
        .replace("fill: black;", "fill: #2e3440;")
        // White backdrop → transparent (let CSS background show through)
        .replace("fill: white;", "fill: transparent;")
        // Filled markers
        .replace(".filled {\n  fill: black;", ".filled {\n  fill: #3b4252;")
        .replace(".filled{fill:black;", ".filled{fill:#3b4252;")
}

#[tauri::command]
pub fn render_ascii_diagram(input: String, dark: Option<bool>) -> String {
    let normalized = normalize_box_drawing(&input);
    let svg = svgbob::to_svg_string_compressed(&normalized);
    if dark.unwrap_or(true) {
        apply_dark_theme(&svg)
    } else {
        apply_light_theme(&svg)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_replaces_box_drawing_chars() {
        let input = "┌──┐\n│  │\n└──┘";
        let result = normalize_box_drawing(input);
        assert_eq!(result, "+--+\n|  |\n+--+");
    }

    #[test]
    fn test_normalize_replaces_tree_chars() {
        let input = "├── src/\n│   └── main.rs\n└── Cargo.toml";
        let result = normalize_box_drawing(input);
        assert_eq!(result, "+-- src/\n|   +-- main.rs\n+-- Cargo.toml");
    }

    #[test]
    fn test_render_returns_svg() {
        let result = render_ascii_diagram("+--+\n|  |\n+--+".into(), None);
        assert!(result.contains("<svg"));
        assert!(result.contains("</svg>"));
    }

    #[test]
    fn test_render_handles_unicode_input() {
        let result = render_ascii_diagram("┌──┐\n│  │\n└──┘".into(), None);
        assert!(result.contains("<svg"));
    }

    #[test]
    fn test_dark_theme_applied() {
        let result = render_ascii_diagram("+--+\n|  |\n+--+".into(), Some(true));
        // Should NOT contain light-mode colors
        assert!(!result.contains("stroke: black;"));
        assert!(!result.contains("fill: white;"));
        // Should contain dark-mode colors
        assert!(result.contains("stroke: #a9b1d6;"));
        assert!(result.contains("fill: #c0caf5;"));
        assert!(result.contains("fill: transparent;"));
    }

    #[test]
    fn test_light_theme_applied() {
        let result = render_ascii_diagram("+--+\n|  |\n+--+".into(), Some(false));
        // Should contain light-mode colors
        assert!(result.contains("stroke: #3b4252;"));
        assert!(result.contains("fill: #2e3440;"));
        assert!(result.contains("fill: transparent;"));
    }

    #[test]
    fn test_default_is_dark() {
        let result = render_ascii_diagram("+--+\n|  |\n+--+".into(), None);
        assert!(result.contains("stroke: #a9b1d6;"));
    }
}
