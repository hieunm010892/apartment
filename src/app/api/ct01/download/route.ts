import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName = '',
      dateOfBirth = '',
      gender = '',
      idCard = '',
      phone = '',
      email = '',
      headName = '',
      relationship = 'Chủ hộ / Đại diện thuê',
      headIdCard = '',
      agency = 'Công an Phường Linh Trung, Thành phố Thủ Đức, TP. Hồ Chí Minh',
      requestContent = '',
      ownerName = 'Trần Thị Mỹ Hạnh',
      ownerIdCard = '079195001234',
      location = 'TP. Hồ Chí Minh',
      declarationDate = new Date().toISOString().slice(0, 10),
    } = body;

    let templatePath = path.join(process.cwd(), 'mau-CT01_1607161041.docx');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'public', 'mau-CT01_1607161041.docx');
    }
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ message: 'Không tìm thấy file mẫu mau-CT01_1607161041.docx' }, { status: 404 });
    }

    const templateBuffer = await fs.promises.readFile(templatePath);
    const zip = await JSZip.loadAsync(templateBuffer);
    const docEntry = zip.file('word/document.xml');
    if (!docEntry) {
      return NextResponse.json({ message: 'File Word không hợp lệ (thiếu word/document.xml)' }, { status: 400 });
    }

    let xml = await docEntry.async('string');

    // Format DOB
    let dobDay = '', dobMonth = '', dobYear = '';
    if (dateOfBirth) {
      const parts = dateOfBirth.includes('-') ? dateOfBirth.split('-') : dateOfBirth.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          dobYear = parts[0]; dobMonth = parts[1]; dobDay = parts[2];
        } else {
          dobDay = parts[0]; dobMonth = parts[1]; dobYear = parts[2];
        }
      }
    }
    const dobFormatted = dobDay && dobMonth && dobYear ? `${dobDay}/${dobMonth}/${dobYear}` : (dateOfBirth || '');

    // Format declaration date: "..., ngày 14 tháng 11 năm 2026"
    const dDate = new Date(declarationDate || Date.now());
    const dayStr = String(dDate.getDate()).padStart(2, '0');
    const monthStr = String(dDate.getMonth() + 1).padStart(2, '0');
    const yearStr = String(dDate.getFullYear());
    const dateFormatted = `${location}, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`;

    // 1. Kính gửi (1)
    if (agency) {
      xml = xml.replace('.................................................', agency);
    }

    // 2. Họ, chữ đệm và tên khai sinh
    if (fullName) {
      xml = xml.replace(
        '1. Họ, chữ đệm và tên khai sinh: ............................................',
        `1. Họ, chữ đệm và tên khai sinh: ${fullName.toUpperCase()}`
      );
    }

    // 3. Ngày sinh & Giới tính
    if (dobFormatted || gender) {
      xml = xml.replace(
        '2. Ngày, tháng, năm sinh: ............./................/................ 3. Giới tính: ...................',
        `2. Ngày, tháng, năm sinh: ${dobFormatted}    3. Giới tính: ${gender || ''}`
      );
    }

    // 4. Số điện thoại & Email
    if (phone || email) {
      xml = xml.replace(
        '5. Số điện thoại liên hệ: ............................ 6. Email: ........................',
        `5. Số điện thoại liên hệ: ${phone || ''}    6. Email: ${email || ''}`
      );
    }

    // 5. Chủ hộ & Mối quan hệ với chủ hộ
    if (headName || relationship) {
      xml = xml.replace(
        ': .................................. 8. Mối quan hệ với chủ hộ: ............................',
        `: ${headName || fullName}    8. Mối quan hệ với chủ hộ: ${relationship || 'Chủ hộ'}`
      );
    }

    // 6. Nội dung đề nghị
    if (requestContent) {
      xml = xml.replace(
        ': ............................................................',
        `: ${requestContent}`
      );
    }

    // 7. Ngày làm tờ khai
    xml = xml.replace('......, ngày......tháng....năm......', dateFormatted);

    // 8. Ý kiến của chủ sở hữu chỗ ở hợp pháp (Cột 2)
    if (ownerName) {
      xml = xml.replace('(8) Họ và tên: .............', `(8) Họ và tên: ${ownerName}`);
    }
    if (ownerIdCard) {
      xml = xml.replace('(8) Số định danh cá nhân:.....', `(8) Số định danh cá nhân: ${ownerIdCard}`);
    }

    // 9. Họ tên người kê khai ở chân cột 4
    if (fullName) {
      const emptyLastCell = '<w:tc><w:tcPr><w:tcW w:w="1250" w:type="pct"/></w:tcPr><w:p w:rsidR="00A85A50" w:rsidRPr="00A85A50" w:rsidRDefault="00A85A50" w:rsidP="009C365B"><w:pPr><w:spacing w:after="120"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="000000" w:themeColor="text1"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:pPr></w:p></w:tc></w:tr></w:tbl>';
      const filledLastCell = `<w:tc><w:tcPr><w:tcW w:w="1250" w:type="pct"/></w:tcPr><w:p w:rsidR="00A85A50" w:rsidRPr="00A85A50" w:rsidRDefault="00A85A50" w:rsidP="009C365B"><w:pPr><w:spacing w:after="120"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:color w:val="000000" w:themeColor="text1"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:color w:val="000000" w:themeColor="text1"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>${fullName.toUpperCase()}</w:t></w:r></w:p></w:tc></w:tr></w:tbl>`;
      xml = xml.replace(emptyLastCell, filledLastCell);
    }

    // Ghi lại vào document.xml
    zip.file('word/document.xml', xml);
    const outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const safeFilename = encodeURIComponent(`To_Khai_CT01_${fullName ? fullName.replace(/\s+/g, '_') : 'NhanKhau'}.docx`);

    return new Response(outputBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
      },
    });
  } catch (err: any) {
    console.error('Error generating CT01 docx:', err);
    return NextResponse.json({ message: 'Lỗi khi tạo file CT01 Word: ' + err.message }, { status: 500 });
  }
}
