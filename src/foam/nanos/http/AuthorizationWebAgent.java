/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.boot.NSpec;

// TODO: Model this.
/**
 * A WebAgent decorator that performs a permission check.
 */
public class AuthorizationWebAgent extends ProxyWebAgent {
  private String permission_;

  public AuthorizationWebAgent(String permission, WebAgent delegate) {
    setDelegate(delegate);
    permission_ = permission;
  }

  @Override
  public void execute(X x) {
    if ( ! ((AuthService) x.get("auth")).check(x, permission_) ) {
      NSpec nSpec = x.get(NSpec.class);
      if ( nSpec != null ) {
        throw new AuthorizationException(String.format("You do not have permission to access the service named '%s'.", nSpec.getName()));
      } else {
        throw new AuthorizationException();
      }
    }

    super.execute(x);
  }
}

