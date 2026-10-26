import styled from "styled-components";
import { getColor } from "@zendeskgarden/react-theming";
import { GenerativeAnswerSourcesList } from "./GenerativeAnswerSourcesList";
import type { CitationArticle } from "../data-types";

interface GenerativeAnswerContentProps {
  generatedAnswer: string;
  citations: CitationArticle[];
  testId: string;
}

const GeneratedAnswerContainer = styled.div`
  background-color: ${({ theme }) =>
    getColor({ theme, variable: "background.recessed" })};
  border-radius: 10px;
`;

const GeneratedAnswerContent = styled.div`
  margin-top: ${(props) => props.theme.space.xs};
  padding: calc(2 * ${(props) => props.theme.space.sm});
  white-space: break-spaces;
`;

export function GenerativeAnswerContent({
  generatedAnswer,
  citations,
  testId,
}: GenerativeAnswerContentProps): JSX.Element {
  return (
    <GeneratedAnswerContainer>
      <GeneratedAnswerContent id={`${testId}-generated-answer-content`}>
        {generatedAnswer}
      </GeneratedAnswerContent>
      <GenerativeAnswerSourcesList citations={citations} testId={testId} />
    </GeneratedAnswerContainer>
  );
}
