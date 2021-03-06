/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pool;

import foam.core.ContextAgent;
import foam.core.X;

public interface ThreadPool {
  public void submit(X x, ContextAgent agent);
}
