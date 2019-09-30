/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.StringTokenizer;

// TODO: Model this.

/**
 * A WebAgent decorator that adds awareness of sessions.
 *
 * It checks for a bearer token in the Authorization header of the HTTP request
 * and if it finds one, looks up the session for that token, creates a subcontext
 * of the request context using the session context, passes that new subcontext
 * to the delegate.
 *
 * Note that we intentionally support ONLY the bearer token authentication
 * scheme. This is done to separate the act of authenticating yourself to the
 * server and the act of accessing a protected resource. This decorator assumes
 * that the user has already authenticated with the authentication endpoint and
 * was given a session token to identify themselves with. They must include that
 * token as the bearer token when accessing services decorated with this class.
 *
 * Services should use this decorator if they want to be aware of the users
 * accessing them.
 */
public class SessionAwareWebAgent extends ProxyWebAgent {
  public SessionAwareWebAgent(WebAgent delegate) {
    setDelegate(delegate);
  }

  @Override
  public void execute(X x) {
    HttpServletRequest request = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    String authorizationHeader = request.getHeader("Authorization");

    if ( SafetyUtil.isEmpty(authorizationHeader) ) {
      response.setHeader("WWW-Authenticate", "Bearer");
      sendError(x, response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthenticated access to a protected resource.");
      return;
    }

    StringTokenizer stringTokenizer = new StringTokenizer(authorizationHeader);

    if ( stringTokenizer.countTokens() != 2 ) {
      sendError(x, response, HttpServletResponse.SC_BAD_REQUEST, "Bad HTTP authentication header format.");
      return;
    }

    String scheme = stringTokenizer.nextToken();

    if ( ! "Bearer".equalsIgnoreCase(scheme) ) {
      sendError(x, response, HttpServletResponse.SC_BAD_REQUEST, "Bad HTTP authentication header format.");
      return;
    }

    String sessionId = stringTokenizer.nextToken();

    DAO localSessionDAO = (DAO) x.get("localSessionDAO");
    Session session = (Session) localSessionDAO.find(sessionId);

    if ( session == null ) {
      sendError(x, response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication token.");
      return;
    }

    if ( ! session.validRemoteHost(request.getRemoteHost()) ) {
      sendError(x, response, HttpServletResponse.SC_FORBIDDEN, "Invalid source address.");
      return;
    }

    session.touch();

    super.execute(session.applyTo(x));
  }

  /** Helper method to reduce code duplication. */
  private void sendError(X x, HttpServletResponse response, int code, String message) {
    try {
      response.sendError(code, message);
    } catch ( IOException e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
  }
}
