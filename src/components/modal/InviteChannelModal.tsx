import axios from "axios";
import { FC, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useInput } from "../../hooks/useInput";
import { Modal } from "./Modal";
import { toast } from "react-toastify";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";

interface IProps {
  show: boolean;
  setShow: (show: boolean) => void;
  onCloseModal: () => void;
}

export const InviteChannelModal: FC<IProps> = ({
  show,
  setShow,
  onCloseModal,
}) => {
  const { talkspace, channel } = useParams<{
    talkspace: string;
    channel: string;
  }>();
  const [inviteMember, onChangeInviteMember, setInviteMember] = useInput("");

  const { data: userData } = useSWR("http://localhost:3095/api/users", fetcher);
  const { mutate: memberMutate } = useSWR(
    userData
      ? `http://localhost:3095/api/workspaces/${talkspace}/members`
      : null,
    fetcher
  );

  const onInviteMember = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (!inviteMember || !inviteMember.trim()) return;
      axios
        .post(
          `http://localhost:3095/api/workspaces/${talkspace}/channels/${channel}/member`,
          {
            email: inviteMember,
          }
        )
        .then((response) => {
          setShow(false);
          setInviteMember("");
          memberMutate(response?.data, false);
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: "bottom-center" });
        });
    },
    [inviteMember, talkspace, channel, setShow, setInviteMember, memberMutate]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <label id="member-label">
          <input
            id="member"
            type="email"
            value={inviteMember}
            onChange={onChangeInviteMember}
          />
        </label>
        <button type="submit">초대하기</button>
      </form>
    </Modal>
  );
};
