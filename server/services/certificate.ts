import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { Certificate } from '@shared/schema';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll use the official TGA logo image from local file
const TGA_LOGO_PATH = path.join(process.cwd(), 'client/public/images/tga_logo.png');

// Helper functions
async function generateQRCode(text: string): Promise<string> {
  return await QRCode.toDataURL(text);
}

type BilingualContent = {
  ar: string;
  en: string;
};

type CertificateTypeConfig = {
  title: BilingualContent;
  content: (certificate: Certificate) => {
    ar: string[];
    en: string[];
  };
  showTGALogo: boolean;
};

const certificateConfigs: Record<Certificate['type'], CertificateTypeConfig> = {
  'training_center': {
    title: {
      ar: 'شهادة تسجيل مركز تدريب',
      en: 'Training Center Registration Certificate'
    },
    content: (cert) => ({
      ar: [
        'تشهد الهيئة العامة للنقل أن مركز',
        cert.centerName || '',
        'تحت إدارة',
        cert.managerName || '',
        'قد استوفى جميع المتطلبات والمعايير المطلوبة',
        'وتم اعتماده كمركز تدريب معتمد'
      ],
      en: [
        'The Transport General Authority certifies that',
        cert.centerName || '',
        'under the management of',
        cert.managerName || '',
        'has met all required standards and requirements',
        'and is approved as an authorized training center'
      ]
    }),
    showTGALogo: true
  },
  'testing_center': {
    title: {
      ar: 'شهادة تسجيل مركز اختبار',
      en: 'Testing Center Registration Certificate'
    },
    content: (cert) => ({
      ar: [
        'تشهد الهيئة العامة للنقل أن مركز',
        cert.centerName || '',
        'تحت إدارة',
        cert.managerName || '',
        'قد استوفى جميع المتطلبات والمعايير المطلوبة',
        'وتم اعتماده كمركز اختبار معتمد'
      ],
      en: [
        'The Transport General Authority certifies that',
        cert.centerName || '',
        'under the management of',
        cert.managerName || '',
        'has met all required standards and requirements',
        'and is approved as an authorized testing center'
      ]
    }),
    showTGALogo: true
  },
  'course': {
    title: {
      ar: 'شهادة إتمام تدريب',
      en: 'Course Completion Certificate'
    },
    content: (cert) => ({
      ar: [
        `تشهد الهيئة العامة للنقل أن المتدرب`,
        cert.studentName || '',
        'قد أتم بنجاح متطلبات',
        cert.courseName || '',
        `في مركز ${cert.centerName}`
      ],
      en: [
        `The Transport General Authority certifies that`,
        cert.studentName || '',
        'has successfully completed',
        cert.courseName || '',
        `at ${cert.centerName} Training Center`
      ]
    }),
    showTGALogo: true
  }
};

export async function generateCertificatePDF(certificate: Certificate): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
        autoFirstPage: true
      });

      // Collect the PDF data
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const config = certificateConfigs[certificate.type];

      // Add TGA logo at top if required
      if (config.showTGALogo) {
        try {
          // Check if logo file exists
          if (fs.existsSync(TGA_LOGO_PATH)) {
            console.log('Using TGA logo from local file:', TGA_LOGO_PATH);
            console.log('Current working directory:', process.cwd());
            
            // Generate absolute path
            const absoluteLogoPath = path.resolve(TGA_LOGO_PATH);
            console.log('Absolute logo path:', absoluteLogoPath);
            
            // Add the image to the PDF
            doc.image(absoluteLogoPath, (doc.page.width - 200) / 2, 30, {
              width: 200,
              height: 100,
              align: 'center',
              valign: 'center'
            });
            console.log('Logo added successfully to PDF');
          } else {
            console.error('TGA logo file not found at path:', TGA_LOGO_PATH);
            // List directory contents
            try {
              const dir = path.dirname(TGA_LOGO_PATH);
              console.log('Directory contents of', dir, ':', fs.readdirSync(dir));
            } catch (err) {
              console.error('Error listing directory:', err);
            }
          }
        } catch (error) {
          console.error('Error adding TGA logo:', error);
        }
      }

      // Enable RTL text features
      doc.font('Helvetica');

      // Generate QR code with certificate details
      const qrCodeData = await generateQRCode(
        `Certificate Number: ${certificate.certificateNumber}\n` +
        `Issue Date: ${format(new Date(certificate.issuedAt), 'PPP', { locale: enUS })}\n` +
        `رقم الشهادة: ${certificate.certificateNumber}\n` +
        `تاريخ الإصدار: ${format(new Date(certificate.issuedAt), 'PPP', { locale: ar })}`
      );

      // Add QR code at bottom right
      doc.image(qrCodeData, doc.page.width - 150, doc.page.height - 150, { width: 100 });

      // Add bilingual titles
      doc.fontSize(32);
      // Arabic title on right
      doc.text(config.title.ar, doc.page.width / 2, 180, {
        align: 'center',
        features: ['rtla']
      });
      // English title on left
      doc.text(config.title.en, 0, 180, {
        align: 'center',
        width: doc.page.width / 2
      });

      // Certificate content
      const content = config.content(certificate);

      // Add Arabic content on right
      doc.fontSize(18);
      let contentY = 280;
      content.ar.forEach((text, index) => {
        doc.text(text, doc.page.width / 2, contentY + (index * 40), {
          align: 'center',
          features: ['rtla']
        });
      });

      // Add English content on left
      content.en.forEach((text, index) => {
        doc.text(text, 0, contentY + (index * 40), {
          align: 'center',
          width: doc.page.width / 2
        });
      });

      // Add dates at bottom
      doc.fontSize(14);
      const dateY = doc.page.height - 100;

      // English dates on left
      doc.text(`Issue Date: ${format(new Date(certificate.issuedAt), 'PPP', { locale: enUS })}`, 50, dateY);
      if (certificate.type !== 'course' && certificate.expiresAt) {
        doc.text(`Expiry Date: ${format(new Date(certificate.expiresAt), 'PPP', { locale: enUS })}`, 50, dateY + 25);
      }

      // Arabic dates on right
      doc.text(`تاريخ الإصدار: ${format(new Date(certificate.issuedAt), 'PPP', { locale: ar })}`, doc.page.width / 2, dateY, {
        align: 'right',
        features: ['rtla']
      });
      if (certificate.type !== 'course' && certificate.expiresAt) {
        doc.text(`تاريخ الانتهاء: ${format(new Date(certificate.expiresAt), 'PPP', { locale: ar })}`, doc.page.width / 2, dateY + 25, {
          align: 'right',
          features: ['rtla']
        });
      }

      // Add certificate number at bottom
      doc.fontSize(12);
      doc.text(`Certificate Number: ${certificate.certificateNumber}`, 50, doc.page.height - 50);
      doc.text(`رقم الشهادة: ${certificate.certificateNumber}`, doc.page.width - 250, doc.page.height - 50, {
        align: 'right',
        features: ['rtla']
      });

      // Finish the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}