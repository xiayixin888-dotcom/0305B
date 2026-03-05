import os
import re

base_dir = '/Users/xia/Documents/trae_projects/私域助手0305/ai-0305'

# File order is CRITICAL for dependencies
# Sidebar depends on SmartInput, TaskPlan, Cards, etc.
# Workspace is independent?
# App depends on Sidebar, Workspace
files = [
    'src/types.ts',
    'src/components/ProfileField.tsx',
    'src/components/Cards.tsx',
    'src/components/SmartInput.tsx',
    'src/components/TaskPlan.tsx',
    'src/components/Workspace.tsx',
    'src/components/Sidebar.tsx',
    'src/App.tsx'
]

# Map of library name -> set of imported symbols
imports_map = {
    'react': set(['React']), 
    'react-dom/client': set(['createRoot']), 
    'lucide-react': set(),
    'motion/react': set(),
    'clsx': set(),
    'tailwind-merge': set()
}

# Regex to match standard imports: import ... from '...';
# Matches: import React, { useState } from 'react';
import_pattern = re.compile(r'^\s*import\s+(?:(\w+)(?:,\s*)?)?(?:\{\s*(.*?)\s*\})?\s+from\s+[\'"](.*?)[\'"];?')

# Regex to match side-effect imports: import './style.css';
side_effect_import_pattern = re.compile(r'^\s*import\s+[\'"](.*?)[\'"];?')

content_buffer = []

def process_file(file_path):
    full_path = os.path.join(base_dir, file_path)
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        return

    with open(full_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    file_content = []
    for line in lines:
        stripped = line.strip()
        
        # 1. Check for standard imports
        match = import_pattern.match(stripped)
        if match:
            default_import, named_imports, lib_name = match.groups()
            
            if lib_name in imports_map:
                if default_import:
                    imports_map[lib_name].add(default_import)
                if named_imports:
                    # Split by comma and strip whitespace
                    symbols = [s.strip() for s in named_imports.split(',')]
                    for s in symbols:
                        if s:
                            imports_map[lib_name].add(s)
                continue # Skip this line
            
            # If it's a local import (starts with .), skip it
            if lib_name.startswith('.'):
                continue
            
            # Unknown external lib? Keep it for now, but usually safer to comment out if we don't have it
            # file_content.append(line) 
            continue # Skip unknown imports to avoid runtime errors
        
        # 2. Check for side-effect imports (CSS, etc.)
        side_effect_match = side_effect_import_pattern.match(stripped)
        if side_effect_match:
            # Skip all side-effect imports (css, etc) as we can't handle them in bundle.tsx easily
            # (CSS should be handled via <link> or <style> in index.html if possible)
            continue

        # 3. Remove exports
        line = line.replace('export default function', 'function')
        line = line.replace('export function', 'function')
        line = line.replace('export interface', 'interface')
        line = line.replace('export type', 'type')
        line = line.replace('export const', 'const')
        
        file_content.append(line)

    content_buffer.append(f"\n// --- {file_path} ---\n")
    content_buffer.extend(file_content)

for file in files:
    process_file(file)

# Generate consolidated imports
final_content = []
final_content.append("// Consolidated Imports\n")

for lib, symbols in imports_map.items():
    if not symbols:
        continue
    
    # Special handling for React default import
    default_imp = None
    named_imps = []
    
    for s in symbols:
        if s == 'React':
            default_imp = 'React'
        else:
            named_imps.append(s)
            
    import_str = "import "
    if default_imp:
        import_str += default_imp
        if named_imps:
            import_str += ", "
    
    if named_imps:
        import_str += "{ " + ", ".join(sorted(named_imps)) + " }"
    
    import_str += f" from '{lib}';\n"
    final_content.append(import_str)

# Add bundled content
final_content.extend(content_buffer)

# Add render logic
final_content.append("\n// --- main.tsx entry point ---\n")
final_content.append("const rootElement = document.getElementById('root');\n")
final_content.append("if (rootElement) {\n")
final_content.append("  const root = createRoot(rootElement);\n")
final_content.append("  root.render(<App />);\n")
final_content.append("}\n")

output_path = os.path.join(base_dir, 'bundle.tsx')
with open(output_path, 'w', encoding='utf-8') as f:
    f.writelines(final_content)

print(f"Bundle created at {output_path}")

# Generate share.html (Standalone HTML file)
index_html_path = os.path.join(base_dir, 'index.html')
share_html_path = os.path.join(base_dir, 'share.html')

if os.path.exists(index_html_path):
    with open(index_html_path, 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Replace the script tag with inline content
    # Target: <script type="text/babel" src="./bundle.tsx" data-type="module" data-presets="react,typescript"></script>
    
    bundle_str = "".join(final_content)
    # Escape script tags in bundle content just in case
    bundle_str = bundle_str.replace('</script>', '<\\/script>')
    
    inline_script = f'<script type="text/babel" data-type="module" data-presets="react,typescript">\n{bundle_str}\n</script>'
    
    # Simple string replacement
    target_tag = '<script type="text/babel" src="./bundle.tsx" data-type="module" data-presets="react,typescript"></script>'
    
    if target_tag in index_content:
        share_content = index_content.replace(target_tag, inline_script)
        
        with open(share_html_path, 'w', encoding='utf-8') as f:
            f.write(share_content)
        
        print(f"Shareable HTML created at {share_html_path}")
    else:
        print("Warning: Could not find script tag in index.html to replace for share.html")
else:
    print("Warning: index.html not found, skipping share.html generation")

