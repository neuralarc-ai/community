import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Button,
  Tailwind,
} from '@react-email/components';

interface ConclaveInvitationEmailProps {
  userName: string;
  conclaveTitle: string;
  conclaveDate: string;
  conclaveTime: string;
  conclaveLink: string;
  hostName: string;
  conclaveDescription: string;
}

export const ConclaveInvitationEmail = ({
  userName,
  conclaveTitle,
  conclaveDate,
  conclaveTime,
  conclaveLink,
  hostName,
  conclaveDescription,
}: ConclaveInvitationEmailProps) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sphere.he2.ai';
  const logoUrl = `${siteUrl}/${encodeURIComponent('HeliumLogo_dark (2).png')}`;
  const bgImageUrl = `${siteUrl}/${encodeURIComponent('Group 1000002848.svg')}`;

  const formattedDate = new Date(conclaveDate).toLocaleDateString();
  const formattedTime = new Date(conclaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
        <meta name="x-apple-disable-message-reformatting" />
      </Head>
      <Body style={bodyStyle}>
        <Container style={{ ...containerStyle, backgroundImage: `url(${bgImageUrl})` }}>
          <Section style={cardContainerStyle}>
            <Section style={cardInnerStyle}>
              {/* Logo */}
              <Section style={{ textAlign: 'center', paddingBottom: '30px' }}>
                <Img src={logoUrl} width="56" height="57" alt="Helium Logo" style={logoStyle} />
              </Section>

              {/* Main Heading: Conclave Invitation: [Conclave Title] */}
              <Text style={{ ...mainHeadingStyle, textAlign: 'center' }}>
                Conclave Invitation: <span style={{ color: '#27584F' }}>{conclaveTitle}</span>
              </Text>

              {/* Greeting */}
              <Text style={paragraphStyle}>Hi {userName},</Text>

              {/* Intro Sentence */}
              <Text style={paragraphStyle}>You're invited to a conclave hosted by {hostName}!</Text>

              {/* Accent Highlight Card (Conclave Details) */}
              <Section style={highlightCardContainerStyle}>
                <Text style={highlightCardTitleStyle}>Conclave: {conclaveTitle}</Text>
                <Text style={highlightCardParagraphStyle}>Description: {conclaveDescription}</Text>
                <Text style={highlightCardParagraphStyle}>Date: {formattedDate}</Text>
                <Text style={highlightCardParagraphStyle}>Time: {formattedTime}</Text>
              </Section>

              {/* CTA Button */}
              <Section style={{ textAlign: 'center', paddingBottom: '30px' }}>
                <Button href={conclaveLink} style={buttonStyle}>
                  Join Conclave
                </Button>
              </Section>

              {/* Closing and Team Helium */}
              <Text style={paragraphStyle}>We look forward to seeing you there.</Text>
              <Text style={{ ...paragraphStyle, paddingTop: '10px' }}>
                Best regards,<br />The Sphere Community Portal Team
              </Text>
            </Section>
          </Section>

          {/* Footer with Copyright */}
          <Section style={footerContainerStyle}>
            <Text style={footerTextStyle}>
              © 2025 Sphere Community Portal. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const bodyStyle: React.CSSProperties = {
  width: '100%',
  WebkitTextSizeAdjust: '100%',
  textSizeAdjust: '100%',
  backgroundColor: '#f5f5f5',
  margin: '0',
  padding: '0',
  fontFamily: 'Arial, Helvetica, sans-serif',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  width: '100%',
  backgroundColor: '#f5f5f5',
  padding: '40px 0',
  margin: '0 auto',
  backgroundRepeat: 'repeat',
  backgroundPosition: 'top center',
};

const cardContainerStyle: React.CSSProperties = {
  maxWidth: '600px',
  width: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  margin: '0 auto',
};

const cardInnerStyle: React.CSSProperties = {
  padding: '40px 30px',
};

const logoStyle: React.CSSProperties = {
  display: 'block',
  width: '56px',
  height: 'auto',
  maxWidth: '56px',
  margin: '0 auto',
};

const mainHeadingStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '28px',
  lineHeight: '1.3',
  color: '#333333',
  fontWeight: '700',
  paddingBottom: '20px',
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  paddingBottom: '10px',
};

const highlightCardContainerStyle: React.CSSProperties = {
  backgroundColor: '#e0f2f1',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '30px',
};

const highlightCardTitleStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#27584F',
  fontWeight: '700',
  paddingBottom: '10px',
};

const highlightCardParagraphStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#555555',
};

const buttonStyle: React.CSSProperties = {
  background: '#27584F',
  border: '15px solid #27584F',
  padding: '0 10px',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '25px',
  display: 'inline-block',
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
};

const footerContainerStyle: React.CSSProperties = {
  maxWidth: '600px',
  width: '100%',
  margin: '0 auto',
};

const footerTextStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#777777',
  paddingTop: '20px',
  textAlign: 'center',
};
