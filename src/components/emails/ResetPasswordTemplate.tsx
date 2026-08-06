import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

interface VerifyEmailProps {
  confirmLink: string;
  appName?: string;
  name?: string;
}

export const ResetPasswordTemplate = ({
  confirmLink,
  appName = 'Your App',
  name = 'Student',
}: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for {appName}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="mx-auto my-0 mb-16 max-w-[560px] rounded-lg bg-white p-[40px_20px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <Heading className="pt-4 text-[24px] font-bold tracking-tight text-[#484848] leading-[1.3]">
              Reset Password for {appName}
            </Heading>

            <Text className="mb-[15px] text-[15px] leading-[1.4] text-[#3c4149]">Hi {name},</Text>
            <Text className="mb-[15px] text-[15px] leading-[1.4] text-[#3c4149]">
              We received a request to reset your password for your HMM LMS account. Click the
              button below to reset your password:
            </Text>
            <Text className="mb-[15px] text-[15px] leading-[1.4] text-[#3c4149]">
              This link will expire in 1 hour for security reasons.
            </Text>

            <Section className="my-6 text-center">
              <Button
                className="inline-block rounded-md bg-[#0070f3] px-6 py-3 text-[15px] font-semibold text-white no-underline"
                href={confirmLink}
              >
                Reset Password
              </Button>
            </Section>

            <Text className="mb-[15px] text-[15px] leading-[1.4] text-[#3c4149]">
              If you didn't request a password reset, you can safely ignore this email.
            </Text>

            <Hr className="my-5 border-[#e6ebf1]" />

            <Text className="my-[4px] text-[12px] leading-[1.4] text-[#8898aa]">
              If the button above doesn't work, copy and paste this URL into your browser:
            </Text>
            <Text className="my-[4px] text-[12px] leading-[1.4] text-[#8898aa]">
              <Link href={confirmLink} className="text-[#0070f3] underline break-all">
                {confirmLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordTemplate;
