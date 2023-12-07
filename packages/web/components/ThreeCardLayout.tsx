"use client";

import { ICard } from "@/lib/api";
// import { CARD_SHOW_PATH, getPageURL } from "@/lib/paths";
import { supabase } from "@/lib/supabase/supabaseClient";
// import Link from "next/link";
import Rubric from "@/components/Rubric";
import { TABLES } from "@/lib/supabase/db";
import {
  faCheckCircle,
  faChevronDown,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import CommentBox from "./CommentBoxes";
import Citation from "./Citation";
import './ThreeCardLayout.css';
import { relative } from "path";
import container from "postcss/lib/container";
import { space } from "postcss/lib/list";

const criteria = [
  { id: "Accuracy", description: "Accuracy" },
  { id: "Helpfulness", description: "Helpfulness" },
  { id: "Balance", description: "Balance" },
  // Add more criteria as needed
];

const NUM_CARDS_PER_SET = 3;


export default function ThreeCardLayout({
  cards,
  userName,
  answered,
  setAnswered,
}: {
  cards: Array<ICard>;
  userName: string;
  answered: Set<number>;
  setAnswered: (_: any) => void;
}) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Function to update scores
  const handleScoreChange = (criterionId: string, score: number) => {
    setScores((prevScores) => ({ ...prevScores, [criterionId]: score }));
  };

  // Function to reset scores
  const resetScores = () => {
    // Reset logic - assuming each score should reset to 1
    // const resettedScores = Object.keys(scores).reduce((acc, criterionId) => {
    //     acc[criterionId] = 1;
    //     return acc;
    // }, {});

    const resetScores = {
      Accuracy: 1,
      Helpfulness: 1,
      Balance: 1,
    };

    setScores(resetScores);
    setActiveTab(0);
  };

  //Function that sends comments to supabase under respective card.comment
  const submitCommentFeedback = async ({
    scores,
    comment,
    card,
    index,
  }: {
    scores: Record<string, number>;
    comment: string;
    card: ICard;
    index: number;
  }) => {
    try {
      const { data: existingCard, error: fetchError } = await supabase
        .from(TABLES.FEEDBACK_CARDS)
        .select("question_id, id")
        .eq("id", card.id)
        .single();

      // order by random
      // select all ids load them to an array
      // then independent supabase fetch the card with that random id
      // --on button click

      if (fetchError) {
        throw fetchError;
      }
      const user_id = `${userName}_${Date.now()}`;

      const { data, error } = await supabase
        .from(TABLES.USER_FEEDBACK)
        .insert([
          {
            question_id: existingCard.question_id,
            response_id: existingCard.id,
            user_id: user_id,
            comment: comment,
            accuracy: scores["Accuracy"],
            helpfulness: scores["Helpfulness"],
            balance: scores["Balance"],
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      const newAnswered = new Set(answered);
      newAnswered.add(index);
      setAnswered(newAnswered);
    } catch (error) {}
  };

  const Tabs = () => {
    return Array.from({ length: NUM_CARDS_PER_SET }, (_, index) => {
      const isAnswered = answered.has(index);
      return (
        <div
          key={index}
          className="flex-grow cursor-pointer rounded-md bg-primary p-2 text-center text-white"
          onClick={() => {
            setActiveTab(index);
          }}
        >
          Option {index + 1}{" "}
          {isAnswered ? (
            <FontAwesomeIcon
              className="left-2 top-1/2 ml-2 h-[20px] w-[28px] cursor-pointer object-contain"
              icon={faCheckCircle}
            />
          ) : (
            <FontAwesomeIcon
              className="left-2 top-1/2 ml-2 h-[20px] w-[28px] cursor-pointer object-contain"
              icon={faCircleXmark}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex flex-row space-x-2">
        <Tabs />
      </div>
      {cards &&
        cards.map((card, i) =>
          i === activeTab ? (
            <div key={card.id} className="space-x-4-x flex justify-center">
              <div
                key={card.id}
                className={`rounded-lg bg-blue p-6 text-primary`}
              >
                <h4 className="text-xl font-bold">{card.title}</h4>

                {/* <Link href={`${CARD_SHOW_PATH}/${card.id}`}> */}
                {/* LINK DOES the modal-- Need to change card.id to questionID to refer back to original card ID */}
                <div>
                  <h6 className="text-xs">
                    <span className="text-purple">
                      {card.is_mine ? "You | " : null}
                    </span>
                  </h6>

                  <div>
                    {card.responses &&
                      card.responses.map((element, index) => (
                        <p key={index} className="my-5">
                          {element.response}
                        </p>
                      ))}
                      {/* {card.citations && card.citations.map((citation, index) => (
                        <Citation citation={citation} index={index} key={index} />
                      ))} */}
                      {card.citations && card.citations.length > 0 && (
                        <div className="dropdown-container">
                          <div
                            className="dropdown-header"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            Citations
                            <FontAwesomeIcon
                              className={`ml-2 h-[16px] w-[16px] transition-transform transform ${
                                isDropdownOpen ? 'rotate-180' : ''
                              }`}
                              icon={faChevronDown}
                            />
                          </div>
                          {isDropdownOpen && (
                            <div className="dropdown-content">
                              {card.citations.map((citation, index) => (
                                <Citation citation={citation} index={index} key={index} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {!answered.has(i) && (
                  <div>
                    <hr></hr>
                    {/* <label className="flex justify-center mt-10 space-x-1-x">Rubric</label> */}

                    <Rubric
                      criteria={criteria}
                      scores={scores}
                      onScoreChange={handleScoreChange}
                    />

                    <CommentBox
                      scores={scores}
                      card={card}
                      onSubmit={submitCommentFeedback}
                      onReset={resetScores}
                      index={i}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null
        )}
    </div>
  );
}