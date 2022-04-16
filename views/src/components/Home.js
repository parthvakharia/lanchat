import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import { useSocketContext } from "../providers/SocketProvider";

const OnlineUsers = ({ selectedClient, setSelectedClient }) => {
  const { clients, getCurrentClientId } = useSocketContext();

  return (
    <ListGroup>
      {Object.keys(clients).map((clientId, index) => {
        if (getCurrentClientId() === clientId) return null;

        const client = clients[clientId];
        const messageReceived = client?.messageReceived?.[clientId];
        const lastMessage = messageReceived
          ? messageReceived[messageReceived.length - 1]
          : null;
        const unreadMessageCount = messageReceived?.reduce((pv, cv) => {
          if (!cv?.read) pv++;
          return pv;
        }, 0);

        return (
          <ListGroupItem
            key={index}
            active={selectedClient?.clientId === clientId}
            onClick={() => setSelectedClient(client)}
          >
            <ListGroupItemHeading>{client.userName}</ListGroupItemHeading>
            <ListGroupItemText>
              {lastMessage?.message}

              {unreadMessageCount > 0 && (
                <Badge color="primary" pill>
                  {unreadMessageCount}
                </Badge>
              )}
            </ListGroupItemText>
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
};

const DisplayMessages = ({ selectedClient }) => {
  const { clients, getCurrentClientId, sendMessage } = useSocketContext();
  const client = clients[selectedClient.clientId];
  const currentUserClientId = getCurrentClientId();
  const [message, setMessage] = useState("");
  const messageReceivedClientIds = Object.keys(client?.messageReceived || {});
  const from = messageReceivedClientIds?.find(
    (id) => currentUserClientId !== id
  );
  const to = messageReceivedClientIds?.find((id) => currentUserClientId === id);
  const messageToDisplay = [
    ...(client?.messageReceived?.[from] || []),
    ...(client?.messageReceived?.[to] || []),
  ].sort((a, b) => new Date(a.date) > new Date(b.date));

  const onEnterPress = (event) => {
    if (event.keyCode === 13) {
      sendMessage(message, selectedClient.clientId);
      setMessage("");
    }
  };

  return (
    <div className="d-flex justify-content-between flex-column h-100">
      <div>
        {messageToDisplay &&
          messageToDisplay.map((payload, index) => (
            <div key={index}>
              {payload.message} - {payload.timestamp}
            </div>
          ))}
      </div>

      <div>
        <FormGroup>
          <Input
            id="message"
            name="message"
            placeholder="Write message and press enter to send"
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={onEnterPress}
          />
        </FormGroup>
      </div>
    </div>
  );
};

const Home = () => {
  const { clients, getCurrentClientId } = useSocketContext();
  const [selectedClient, setSelectedClient] = useState(null);
  const currentUserClientId = getCurrentClientId();

  return (
    <>
      <Container fluid className="height-100vh mt-2">
        <Row className="h-100">
          <Col sm={4} className="border-end">
            <OnlineUsers
              clients={clients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              currentUserClientId={currentUserClientId}
            />
          </Col>
          <Col sm={8}>
            {selectedClient ? (
              <DisplayMessages selectedClient={selectedClient} />
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                  <div>Welcome to LanChat</div>
                  <div>Select user to start chat</div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
