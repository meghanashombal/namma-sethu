import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function smsBackendPlugin(): Plugin {
  return {
    name: 'sms-backend-api',
    configureServer(server) {
      server.middlewares.use('/api/send-sms', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const { phone, message, complaintId } = payload;

            const twilioSid = process.env.TWILIO_ACCOUNT_SID;
            const twilioToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
            const fast2smsKey = process.env.FAST2SMS_API_KEY;

            if (twilioSid && twilioToken && twilioFrom) {
              const params = new URLSearchParams();
              params.append('To', phone);
              params.append('From', twilioFrom);
              params.append('Body', message);

              const twilioRes = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                {
                  method: 'POST',
                  headers: {
                    Authorization:
                      'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: params.toString(),
                }
              );

              const twilioData = (await twilioRes.json()) as any;
              if (twilioRes.ok) {
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    provider: 'Twilio Cellular Gateway',
                    sid: twilioData.sid,
                    status: twilioData.status,
                    phone,
                  })
                );
                return;
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    provider: 'Twilio',
                    error: twilioData.message || 'Twilio cellular dispatch failed',
                  })
                );
                return;
              }
            } else if (fast2smsKey) {
              const cleanDigits = phone.replace(/[^0-9]/g, '').slice(-10);
              const fastRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                  authorization: fast2smsKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  route: 'v3',
                  sender_id: 'CVICTR',
                  message: message,
                  language: 'english',
                  flash: 0,
                  numbers: cleanDigits,
                }),
              });
              const fastData = (await fastRes.json()) as any;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: fastData.return === true,
                  provider: 'Fast2SMS Indian Gateway',
                  messageId: fastData.request_id,
                  phone,
                })
              );
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                noGatewayConfigured: true,
                message:
                  'No telecom SMS gateway (Twilio / Fast2SMS) configured in environment secrets.',
                phone,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), smsBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
