import { Html, Head, Body, Container, Text, Section, Hr, Link, Img } from '@react-email/components';
import * as React from 'react';

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
}: ConclaveInvitationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/logo Sphere black.png`}
            width="48"
            height="48"
            alt="Sphere Community Portal"
            style={logo}
          />
          <Text style={heading}>Conclave Invitation: {conclaveTitle}</Text>
          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            You're invited to a conclave hosted by {hostName}!
          </Text>
          <Text style={paragraph}>
            <strong>Conclave:</strong> {conclaveTitle}
          </Text>
          <Text style={paragraph}>
            <strong>Description:</strong> {conclaveDescription}
          </Text>
          <Text style={paragraph}>
            <strong>Date:</strong> {new Date(conclaveDate).toLocaleDateString()}
          </Text>
          <Text style={paragraph}>
            <strong>Time:</strong> {new Date(conclaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={conclaveLink}>
              Join Conclave
            </Link>
          </Section>
          <Text style={paragraph}>
            We look forward to seeing you there.
          </Text>
          <Text style={paragraph}>
            Best regards,
            <br />
            The Sphere Community Portal Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Sphere Community Portal, Powered by Neural Arc Inc.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const logo = {
  margin: '0 auto',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as 'center',
  color: '#333',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333',
};

const buttonContainer = {
  textAlign: 'center' as 'center',
  padding: '30px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as 'center',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};

