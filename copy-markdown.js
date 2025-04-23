const fs = require('fs');
const path = require('path');

// Make sure the public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Clean the public directory of markdown files first
console.log('Cleaning public directory...');
try {
  const files = fs.readdirSync('public');
  files.forEach(file => {
    if (file.endsWith('.md')) {
      fs.unlinkSync(path.join('public', file));
      console.log(`Removed old file: ${file}`);
    }
  });
} catch (error) {
  console.error('Error cleaning directory:', error);
}

// 이스케이프된 문자열을 원래 문자로 변환하는 함수
function unescapeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

// List of markdown files to copy
const markdownFiles = [
  'executive_summary.md',
  'project_plan.md',
  'execution_plan_timeline.md',
  'networking_partnership_strategy.md',
  'marketing_sales_strategy.md',
  'target_companies_list.md',
  'us_b2b_tech_market_trends.md',
  'company_profile.md'
];

// Ensure each file is only copied once by using a Set
const processedFiles = new Set();

// Copy each file to the public directory with proper processing
markdownFiles.forEach(file => {
  if (processedFiles.has(file)) {
    console.log(`Skipping duplicate file: ${file}`);
    return;
  }
  
  if (fs.existsSync(file)) {
    console.log(`Processing ${file} to public directory...`);
    
    // 파일 읽기
    let content = fs.readFileSync(file, 'utf8');
    
    // JSON 문자열 형식인지 확인하고 처리
    if (content.startsWith('"') && content.endsWith('"')) {
      try {
        // JSON 문자열을 파싱하여 이스케이프된 문자를 제대로 변환
        content = JSON.parse(content);
        console.log(`Fixed JSON-encoded content in ${file}`);
      } catch (err) {
        console.error(`Error parsing JSON content from ${file}:`, err);
        
        // JSON 파싱이 실패하더라도 최대한 문자 처리 시도
        content = content.slice(1, -1); // 따옴표 제거
        content = unescapeString(content);
        console.log(`Manually unescaped content in ${file}`);
      }
    }
    
    // 이스케이프 문자열 처리 (JSON이 아닌 경우도 처리)
    content = unescapeString(content);
    
    // 변환된 내용으로 파일 저장
    fs.writeFileSync(path.join('public', file), content);
    processedFiles.add(file);
    console.log(`Successfully processed ${file}`);
  } else {
    console.error(`Error: ${file} does not exist in the root directory.`);
  }
});

console.log('All markdown files have been processed and copied to the public directory.'); 