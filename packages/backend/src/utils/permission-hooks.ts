import * as authentication from '@feathersjs/authentication';
import { HookContext } from '../declarations';
import { setField } from 'feathers-authentication-hooks';
import { iff } from 'feathers-hooks-common';
import checkPermissions from 'feathers-permissions';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

async function limitToUserOrPublic(context: HookContext): Promise<HookContext> {
  const { type } = context;
  let { params } = context;

  if (type !== 'before') {
    throw new Error('The "limitToUserOrPublic" hook should only be used as a "before" hook.');
  }
  const userId = params?.user?._id;

  if (userId === undefined) {
    throw new Error('Expected field user not available');
  }

  if (!params) {
    params = {};
  }
  if (!params.query) {
    params.query = {};
  }

  if (params.query.public === undefined) {
    // params.query.$or = [
    //   { ...params.query, userId: userId },
    //   { ...params.query, public: true },
    // ];
    params.query.$or = [{ userId }, { public: true }];
  } else if (params.query.public === false) {
    params.query.userId = userId;
  }

  return context;
}

export const authHooks = (requireAuth: boolean) => {
  if (requireAuth) {
    return [
      authenticate('jwt'),
      checkPermissions({ roles: ['admin'], error: false }),
      iff(
        (context) => !context.params.permitted,
        limitToUserOrPublic as any, // TODO: Fix this (Dove)
      ),
    ];
  }
  return [];
};

export const authCreateHooks = (requireAuth: boolean) => {
  if (requireAuth) {
    return [setField({ from: 'params.user._id', as: 'data.userId' })];
  }
  return [];
};
