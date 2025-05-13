import { Router } from 'express';
import { storage } from '../storage';
import { generateCertificatePDF } from '../services/certificate';
import QRCode from 'qrcode';

const router = Router();

// Helper function to handle certificate viewing
async function handleCertificateView(req: any, res: any, expectedType: 'training_center' | 'testing_center' | 'course') {
  try {
    const certificateId = parseInt(req.params.id);
    const certificate = await storage.getCertificate(certificateId);

    if (!certificate) {
      return res.status(404).json({ error: 'الشهادة غير موجودة' });
    }

    // Verify certificate type
    if (certificate.type !== expectedType) {
      return res.status(400).json({ error: 'نوع الشهادة غير صحيح' });
    }

    // Generate PDF
    console.log('Generating PDF for certificate:', certificate.id, 'Type:', certificate.type);
    const pdf = await generateCertificatePDF(certificate);
    console.log('PDF generated successfully, size:', pdf.length, 'bytes');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=certificate-${certificate.certificateNumber}.pdf`
    );

    // Send PDF
    res.send(pdf);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الشهادة' });
  }
}

// Route for viewing training center certificates
router.get('/training-center/:id', async (req, res) => {
  await handleCertificateView(req, res, 'training_center');
});

// Route for viewing testing center certificates
router.get('/testing-center/:id', async (req, res) => {
  await handleCertificateView(req, res, 'testing_center');
});

// Route for viewing course completion certificates
router.get('/course/:id', async (req, res) => {
  await handleCertificateView(req, res, 'course');
});

// Keep the old route for backward compatibility, but redirect to the appropriate new route
router.get('/view/:id', async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    const certificate = await storage.getCertificate(certificateId);

    if (!certificate) {
      return res.status(404).json({ error: 'الشهادة غير موجودة' });
    }

    // Redirect to the appropriate new route
    res.redirect(`/certificates/${certificate.type}/${certificateId}`);
  } catch (error) {
    console.error('Error in certificate redirect:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء توجيه طلب الشهادة' });
  }
});

// Route for viewing/downloading certificate in HTML
router.get('/download/:id', async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    const certificate = await storage.getCertificate(certificateId);

    if (!certificate) {
      return res.status(404).json({ error: 'الشهادة غير موجودة' });
    }
    
    // Note: We're not requiring authentication for this route to allow public certificate verification
    
    // Generate QR code for certificate verification
    const baseUrl = req.protocol + '://' + req.get('host');
    const verificationUrl = `${baseUrl}/certificates/download/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 150
    });

    // Get student information if this is a course certificate
    let studentName = certificate.studentName || '';
    if (certificate.studentId) {
      const student = await storage.getUser(certificate.studentId);
      if (student) {
        studentName = student.fullName || student.username;
      }
    }
    
    // Generate certificate HTML
    const certificateHtml = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>شهادة مطابقة</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .certificate {
          width: 800px;
          padding: 40px;
          background-color: white;
          border: 15px solid #1e3a8a;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
          position: relative;
        }
        .certificate-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .certificate-logo img {
          height: 80px;
          max-width: 100%;
        }
        .certificate-header {
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .certificate-title {
          font-size: 36px;
          color: #1e3a8a;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .certificate-subtitle {
          font-size: 18px;
          color: #374151;
          margin-bottom: 20px;
        }
        .certificate-body {
          margin-bottom: 30px;
        }
        .certificate-student {
          font-size: 28px;
          color: #1e3a8a;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .certificate-text {
          font-size: 18px;
          color: #374151;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .certificate-course {
          font-size: 22px;
          color: #1e3a8a;
          margin: 20px 0;
        }
        .certificate-date {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 40px;
        }
        .certificate-footer {
          display: flex;
          justify-content: space-between;
          border-top: 2px solid #e5e7eb;
          padding-top: 20px;
        }
        .certificate-signature {
          text-align: center;
        }
        .certificate-signature-line {
          width: 200px;
          height: 1px;
          background-color: #000;
          margin: 0 auto 10px;
        }
        .certificate-signature-title {
          font-size: 16px;
          color: #374151;
        }
        .certificate-id {
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-size: 14px;
          color: #6b7280;
        }
        .certificate-qr {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 100px;
          height: 100px;
        }
        .certificate-qr img {
          width: 100%;
          height: 100%;
        }
        .qr-text {
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="certificate-logo">
          <img src="https://salogos.org/wp-content/uploads/2023/02/%D8%A7%D9%84%D9%87%D9%8A%D8%A6%D8%A9-%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D8%A9-%D9%84%D9%84%D9%86%D9%82%D9%84-%D8%AC%D8%AF%D9%8A%D8%AF.png" alt="شعار هيئة النقل">
        </div>
        
        <div class="certificate-header">
          <div class="certificate-title">شهادة مطابقة</div>
          <div class="certificate-subtitle">منصة التدريب المهني للسائقين</div>
        </div>
        
        <div class="certificate-body">
          <div class="certificate-student">${studentName}</div>
          <div class="certificate-text">
            نشهد بأن الطالب المذكور أعلاه قد استكمل متطلبات مطابقة الشهادة التالية:
          </div>
          <div class="certificate-course">${certificate.courseName}</div>
          <div class="certificate-date">تاريخ الإصدار: ${new Date(certificate.issuedAt).toLocaleDateString('ar-SA')}</div>
        </div>
        
        <div class="certificate-footer">
          <div class="certificate-signature">
            <div class="certificate-signature-line"></div>
            <div class="certificate-signature-title">مدير المنصة</div>
          </div>
          <div class="certificate-signature">
            <div class="certificate-signature-line"></div>
            <div class="certificate-signature-title">إدارة الجودة</div>
          </div>
        </div>
        
        <div class="certificate-id">
          رقم الشهادة: ${certificate.certificateNumber}
        </div>
        
        <div class="certificate-qr">
          <img src="${qrCodeDataUrl}" alt="QR Code للتحقق">
          <div class="qr-text">تحقق من صحة الشهادة</div>
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Send HTML certificate
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(certificateHtml);
  } catch (error) {
    console.error('Error displaying certificate in HTML:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء عرض الشهادة' });
  }
});

export default router;
